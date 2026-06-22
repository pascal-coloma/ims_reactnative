import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AtencionProvider, useAtenciones } from '@/context/AtencionContext';
import { Atencion } from '@/data/types';

jest.mock('@/context/AuthContext', () => ({
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

const atencion: Atencion = {
  despachoId: '5',
  fechaRegistro: '2024-01-15T10:30:00',
  paciente: {
    primerNombre: 'Juan',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'González',
    rut: '11111111-1',
    fechaNacimiento: '1990-01-01',
    condicionPaciente: 'Estable',
    direccionOrigen: 'Calle 1',
  },
  controlSignos: [
    {
      hora: '10:30',
      pas: 120,
      pad: 80,
      pam: 93,
      fc: 70,
      fr: 16,
      satO2: 98,
      fio2: 21,
      temperatura: 36.5,
      hgt: 90,
      gcs: 15,
      eva: 0,
    },
  ],
  preInforme: { preInforme: 'pre', motivoLlamado: 'caída', estadoPaciente: 'estable' },
  cronologia: {
    horaLlamada: '10:00',
    despachoMovil: '10:05',
    llegadaQTH1: '10:15',
    salidaQTH1: '10:40',
    llegadaQTH2: '10:50',
    salidaQTH2: '11:00',
    categoria: 'C1',
  },
  insumosUtilizados: [{ insumoId: '1', dosis: 2, observaciones: 'obs' }],
  rutReceptor: '22222222-2',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AtencionProvider>{children}</AtencionProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AtencionContext', () => {
  describe('agregarAtencion', () => {
    it('POSTs the transformed payload and stores the result', async () => {
      const apiResult = { atencion_id: 42 };
      mockFetchConSesion.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(apiResult),
      });
      const { result } = renderHook(() => useAtenciones(), { wrapper });

      let returned: any;
      await act(async () => {
        returned = await result.current.agregarAtencion(atencion, '7');
      });

      expect(mockFetchConSesion).toHaveBeenCalledWith(
        '/ims/api/atenciones/add/',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetchConSesion.mock.calls[0][1].body);
      expect(body.despacho).toEqual({
        despacho_id: 5,
        ambulancia_id: 7,
        hora_salida: '2024-01-15T10:30:00',
        hora_llegada: '2024-01-15T10:15:00',
      });
      expect(body.signos_vitales[0].hora).toBe('1030');
      expect(body.insumos_utilizados[0]).toEqual({
        presentacion_id: 1,
        cantidad_usada: 2,
        observaciones: 'obs',
      });
      expect(returned).toEqual(apiResult);
      expect(result.current.atenciones).toContainEqual(atencion);
    });

    it('throws a specific message on 409 (despacho cerrado o sin stock)', async () => {
      mockFetchConSesion.mockResolvedValue({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({}),
      });
      const { result } = renderHook(() => useAtenciones(), { wrapper });
      await expect(
        act(async () => {
          await result.current.agregarAtencion(atencion, '7');
        }),
      ).rejects.toThrow('Este despacho ya fue finalizado o no hay stock suficiente');
    });

    it('throws a generic error on other failures', async () => {
      mockFetchConSesion.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });
      const { result } = renderHook(() => useAtenciones(), { wrapper });
      await expect(
        act(async () => {
          await result.current.agregarAtencion(atencion, '7');
        }),
      ).rejects.toThrow('Error registrando atención: 500');
    });
  });

  describe('fetchAtenciones', () => {
    it('maps the API response into resumenAtenciones', async () => {
      mockFetchConSesion.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            atencion_id: 1,
            hora_salida: '10:00',
            hora_llegada: '10:30',
            estado_sello: 'sellado',
            firma_digital: 'abc',
            despacho: { paciente: { nombre: 'Juan Pérez' } },
          },
          {
            atencion_id: 2,
            hora_salida: '11:00',
            hora_llegada: null,
            estado_sello: 'pendiente',
            despacho: {},
          },
        ]),
      });
      const { result } = renderHook(() => useAtenciones(), { wrapper });
      await act(async () => {
        await result.current.fetchAtenciones();
      });
      expect(result.current.resumenAtenciones).toEqual([
        {
          id: 1,
          hora_salida: '10:00',
          hora_llegada: '10:30',
          estado_sello: 'sellado',
          firma_digital: 'abc',
          paciente__nombre_completo: 'Juan Pérez',
        },
        {
          id: 2,
          hora_salida: '11:00',
          hora_llegada: null,
          estado_sello: 'pendiente',
          firma_digital: '',
          paciente__nombre_completo: 'Sin paciente',
        },
      ]);
    });

    it('sets error when the request fails', async () => {
      mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
      const { result } = renderHook(() => useAtenciones(), { wrapper });
      await act(async () => {
        await result.current.fetchAtenciones();
      });
      expect(result.current.error).not.toBeNull();
      expect(result.current.resumenAtenciones).toEqual([]);
    });
  });

  describe('fetchAtencionDetalle', () => {
    const realFetch = global.fetch;
    afterEach(() => {
      global.fetch = realFetch;
    });

    it('downloads the S3 document and merges the sello from resumenAtenciones', async () => {
      mockFetchConSesion
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue([
            {
              atencion_id: 1,
              hora_salida: '10:00',
              hora_llegada: '10:30',
              estado_sello: 'sellado',
              firma_digital: 'firma-1',
              despacho: { paciente: { nombre: 'Juan Pérez' } },
            },
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: 'https://s3.example.com/doc/1' }),
        });
      global.fetch = jest
        .fn()
        .mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ atencion: {} }) });

      const { result } = renderHook(() => useAtenciones(), { wrapper });
      await act(async () => {
        await result.current.fetchAtenciones();
      });

      let documento: any;
      await act(async () => {
        documento = await result.current.fetchAtencionDetalle(1);
      });

      expect(global.fetch).toHaveBeenCalledWith('https://s3.example.com/doc/1');
      expect(documento.atencion.estado_sello).toBe('sellado');
      expect(documento.atencion.sello_electronico).toBe('firma-1');
    });

    it('returns null and sets error when the S3 download fails', async () => {
      mockFetchConSesion.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: 'https://s3.example.com/doc/1' }),
      });
      global.fetch = jest
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 403,
          text: jest.fn().mockResolvedValue('Forbidden'),
        });

      const { result } = renderHook(() => useAtenciones(), { wrapper });
      let documento: any;
      await act(async () => {
        documento = await result.current.fetchAtencionDetalle(1);
      });
      expect(documento).toBeNull();
      expect(result.current.error).not.toBeNull();
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAtenciones())).toThrow();
  });
});
