import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AmbulanciaProvider, useAmbulancias } from '@/context/AmbulanciaContext';
import { mockAmbulancias } from '@/data/mock/mockAmbulancia';

jest.mock('@/context/AuthContext', () => ({
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AmbulanciaProvider>{children}</AmbulanciaProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AmbulanciaContext', () => {
  it('populates ambulancias from API on mount', async () => {
    const apiData = [
      { id: 10, patente: 'API-001', modelo: 'Test Van', estado_disponibilidad: 'disponible' },
    ];
    mockFetchConSesion.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiData),
    });

    const { result } = renderHook(() => useAmbulancias(), { wrapper });

    await act(async () => {});

    expect(result.current.ambulancias).toEqual([
      { id: '10', patente: 'API-001', modelo: 'Test Van', estado_disponibilidad: 'disponible' },
    ]);
    expect(result.current.error).toBeNull();
  });

  it('falls back to mock data and sets error when fetch fails', async () => {
    mockFetchConSesion.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAmbulancias(), { wrapper });

    await act(async () => {});

    expect(result.current.ambulancias).toEqual(mockAmbulancias);
    expect(result.current.error).not.toBeNull();
  });

  it('falls back to mock data on network error', async () => {
    mockFetchConSesion.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAmbulancias(), { wrapper });

    await act(async () => {});

    expect(result.current.ambulancias).toEqual(mockAmbulancias);
    expect(result.current.error).toBe('Network error');
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAmbulancias())).toThrow();
  });
});
