import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import InventarioProvider, { useInventario } from '@/context/InventoryContext';
import { Insumo } from '@/data/types/types';

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
    presentacion: { id: 1, nombre: 'Paracetamol', categoria: 'Analgésicos', cantidad: 500, unidad_medida: 'mg' },
    ambulancia: { patente: 'ABC-001', stock: 10 },
  },
  {
    presentacion: { id: 2, nombre: 'Suero fisiológico', categoria: 'Soluciones IV', cantidad: 500, unidad_medida: 'ml' },
    ambulancia: { patente: 'ABC-001', stock: 6 },
  },
];

const mappedInsumos: Insumo[] = [
  { id: '1', nombre: 'Paracetamol', categoria: 'Analgésicos', cantidad: 500, unidadMedida: 'mg', ambulanciaPatente: 'ABC-001', stock: 10 },
  { id: '2', nombre: 'Suero fisiológico', categoria: 'Soluciones IV', cantidad: 500, unidadMedida: 'ml', ambulanciaPatente: 'ABC-001', stock: 6 },
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

  describe('agregarInsumo', () => {
    it('appends a new item to local state', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      const newInsumo: Insumo = {
        id: '99', nombre: 'Test Item', categoria: 'Test', cantidad: 1, unidadMedida: 'unidades', ambulanciaPatente: 'XYZ-001', stock: 3,
      };
      act(() => { result.current.agregarInsumo(newInsumo); });
      expect(result.current.insumos).toContainEqual(newInsumo);
      expect(result.current.insumos.length).toBe(mappedInsumos.length + 1);
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

  describe('editarInsumo', () => {
    it('updates only the target insumo', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      const target = mappedInsumos[0];
      act(() => {
        result.current.editarInsumo(target.id, { ...target, nombre: 'Actualizado', stock: 99 });
      });
      const updated = result.current.insumos.find((i) => i.id === target.id);
      expect(updated?.nombre).toBe('Actualizado');
      expect(updated?.stock).toBe(99);
    });

    it('does not affect other items', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      act(() => {
        result.current.editarInsumo(mappedInsumos[0].id, { ...mappedInsumos[0], nombre: 'Cambiado' });
      });
      expect(result.current.insumos.find((i) => i.id === mappedInsumos[1].id)).toEqual(mappedInsumos[1]);
    });
  });

  describe('eliminarInsumo', () => {
    it('removes the item from local state', async () => {
      const { result } = renderHook(() => useInventario(), { wrapper });
      await act(async () => {});
      const targetId = mappedInsumos[0].id;
      act(() => { result.current.eliminarInsumo(targetId); });
      expect(result.current.insumos.find((i) => i.id === targetId)).toBeUndefined();
      expect(result.current.insumos.length).toBe(mappedInsumos.length - 1);
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useInventario())).toThrow();
  });
});
