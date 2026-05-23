import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import InventarioProvider, { useInventario } from '@/context/InventoryContext';
import mockInsumos, { Insumo } from '@/data/constants/mockInventario';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InventarioProvider>{children}</InventarioProvider>
);

const newInsumo: Insumo = {
  id: '99',
  nombre: 'Test Item',
  stockTotal: 5,
  stockMinimo: 1,
  unidadMedida: 'unidades',
  tipo: 'material',
  ubicacion: 'bodega',
};

describe('InventarioContext', () => {
  it('initializes with mock data', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    expect(result.current.insumos).toEqual(mockInsumos);
  });

  it('agregarInsumo appends a new item', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    act(() => {
      result.current.agregarInsumo(newInsumo);
    });
    expect(result.current.insumos).toContainEqual(newInsumo);
    expect(result.current.insumos.length).toBe(mockInsumos.length + 1);
  });

  it('buscarInsumo filters by ubicacion bodega', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    const found = result.current.buscarInsumo('bodega');
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((i) => i.ubicacion === 'bodega')).toBe(true);
  });

  it('buscarInsumo filters by ubicacion ambulancia', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    const found = result.current.buscarInsumo('ambulancia');
    expect(found.every((i) => i.ubicacion === 'ambulancia')).toBe(true);
  });

  it('editarInsumo updates the matching item', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    const target = mockInsumos[0];
    const updated: Insumo = { ...target, nombre: 'Actualizado', stockTotal: 999 };
    act(() => {
      result.current.editarInsumo(target.id, updated);
    });
    const found = result.current.insumos.find((i) => i.id === target.id);
    expect(found?.nombre).toBe('Actualizado');
    expect(found?.stockTotal).toBe(999);
  });

  it('editarInsumo does not affect other items', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    const target = mockInsumos[0];
    const other = mockInsumos[1];
    act(() => {
      result.current.editarInsumo(target.id, { ...target, nombre: 'Cambiado' });
    });
    expect(result.current.insumos.find((i) => i.id === other.id)).toEqual(other);
  });

  it('eliminarInsumo removes the item', () => {
    const { result } = renderHook(() => useInventario(), { wrapper });
    const targetId = mockInsumos[0].id;
    act(() => {
      result.current.eliminarInsumo(targetId);
    });
    expect(result.current.insumos.find((i) => i.id === targetId)).toBeUndefined();
    expect(result.current.insumos.length).toBe(mockInsumos.length - 1);
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useInventario())).toThrow();
  });
});
