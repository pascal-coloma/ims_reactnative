import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import InventarioProvider, { useInventario } from '@/context/InventoryContext';
import { Insumo, NuevoInsumo } from '@/data/types';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { role: 'control', username: 'test', personalId: '1', firstName: 'T', lastName: 'U' },
  })),
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

const apiResponse = [
  {
    presentacion: {
      id: 1,
      nombre: 'Paracetamol',
      categoria: 'Analgésicos',
      cantidad: 500,
      unidad_medida: 'mg',
    },
    ambulancia: { patente: 'ABC-001', stock: 10 },
  },
  {
    presentacion: {
      id: 2,
      nombre: 'Suero fisiológico',
      categoria: 'Soluciones IV',
      cantidad: 500,
      unidad_medida: 'ml',
    },
    ambulancia: { patente: 'ABC-001', stock: 6 },
  },
];

const mappedInsumos: Insumo[] = [
  {
    id: '1',
    nombre: 'Paracetamol',
    categoria: 'Analgésicos',
    cantidad: 500,
    unidadMedida: 'mg',
    ambulanciaPatente: 'ABC-001',
    ambulanciaId: 0,
    stock: 10,
  },
  {
    id: '2',
    nombre: 'Suero fisiológico',
    categoria: 'Soluciones IV',
    cantidad: 500,
    unidadMedida: 'ml',
    ambulanciaPatente: 'ABC-001',
    ambulanciaId: 0,
    stock: 6,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InventarioProvider>{children}</InventarioProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchConSesion.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(apiResponse),
  });
});

describe('InventarioContext', () => {
  describe('fetchInsumos', () => {
    it('loads and maps insumos from API on mount', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      expect(result.current.insumos).toEqual(mappedInsumos);
      expect(result.current.error).toBeNull();
    });

    it('sets error and empty array when fetch fails', async () => {
      mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      expect(result.current.insumos).toEqual([]);
      expect(result.current.error).not.toBeNull();
    });
  });

  describe('agregarInsumos', () => {
    it('POSTs the items and refetches on success', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      const nuevo: NuevoInsumo = {
        nombre_insumo: 'Test Item',
        categoria_id: 1,
        cantidad: 1,
        unidad_medida_id: 1,
        stock: 3,
        ambulancia_id: 0,
      };
      await act(async () => {
        await result.current.agregarInsumos([nuevo]);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/add/', {
        method: 'POST',
        body: JSON.stringify({ items: [nuevo] }),
      });
      // recargar() dispara un refetch
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/');
    });

    it('throws when the request fails', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({ ok: false, status: 400 });
      await expect(
        act(async () => {
          await result.current.agregarInsumos([]);
        }),
      ).rejects.toThrow('Error 400');
    });
  });

  describe('buscarInsumo', () => {
    it('filters by nombre (case-insensitive)', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      const found = result.current.buscarInsumo('paracetamol');
      expect(found.length).toBe(1);
      expect(found[0].nombre).toBe('Paracetamol');
    });

    it('returns empty array when no match', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      expect(result.current.buscarInsumo('inexistente')).toEqual([]);
    });
  });

  describe('actualizarStock', () => {
    it('PATCHes the delta and refetches on success', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      await act(async () => {
        await result.current.actualizarStock(1, 0, -2);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/update/', {
        method: 'PATCH',
        body: JSON.stringify({ presentacion_id: 1, ambulancia_id: 0, cantidad: -2 }),
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/');
    });

    it('throws when the request fails', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(
        act(async () => {
          await result.current.actualizarStock(1, 0, -2);
        }),
      ).rejects.toThrow('Error 500');
    });
  });

  describe('moverInsumo', () => {
    it('PATCHes the move and refetches on success', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      await act(async () => {
        await result.current.moverInsumo(1, 0, 2, 5);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/move/', {
        method: 'PATCH',
        body: JSON.stringify({
          presentacion_id: 1,
          ambulancia_from_id: 0,
          ambulancia_to_id: 2,
          cantidad: 5,
        }),
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/inv/');
    });

    it('throws a specific message on 409 (insufficient stock)', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({ ok: false, status: 409 });
      await expect(
        act(async () => {
          await result.current.moverInsumo(1, 0, 2, 5);
        }),
      ).rejects.toThrow('No hay suficiente stock en la ambulancia de origen');
    });

    it('throws a generic error on other failures', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(
        act(async () => {
          await result.current.moverInsumo(1, 0, 2, 5);
        }),
      ).rejects.toThrow('Error 500');
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useInventario())).toThrow();
  });
});
