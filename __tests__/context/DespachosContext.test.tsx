import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import DespachosProvider, { useDespachos } from '@/context/DespachosContext';
import { Despacho } from '@/data/mock/mockDespachos';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { role: 'medic', username: 'test', personalId: '1', firstName: 'T', lastName: 'U' },
  })),
  fetchConSesion: jest.fn(),
}));

jest.mock('@/context/NotificationContext', () => ({
  useNotifications: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    dismissNotification: jest.fn(),
    markAllRead: jest.fn(),
    lastMessageId: null,
  })),
}));

import { fetchConSesion } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;
const mockUseNotifications = useNotifications as jest.Mock;

const despachoActivo: Despacho = {
  id: 'D1',
  direccionOrigen: 'Calle A 100',
  direccionDestino: 'Hospital X',
  descripcionLlamado: 'C1',
  estado: 'activo',
  personalIds: ['1', '2'],
};

const despachoFinalizado: Despacho = {
  id: 'D2',
  direccionOrigen: 'Calle B 200',
  direccionDestino: 'Hospital Y',
  descripcionLlamado: 'C2',
  estado: 'finalizado',
  personalIds: ['1'],
};

const despachosApiResponse = [despachoActivo, despachoFinalizado];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DespachosProvider>{children}</DespachosProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchConSesion.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(despachosApiResponse),
  });
  mockUseNotifications.mockReturnValue({
    notifications: [],
    unreadCount: 0,
    dismissNotification: jest.fn(),
    markAllRead: jest.fn(),
    lastMessageId: null,
  });
});

describe('DespachosContext', () => {
  describe('fetchDespachos', () => {
    it('loads despachos from API on mount', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});
      expect(result.current.despachos.length).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('sets error and empty array when fetch fails', async () => {
      mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});
      expect(result.current.despachos).toEqual([]);
      expect(result.current.error).not.toBeNull();
    });

    it('refetches when a new push notification arrives', async () => {
      const { rerender } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});
      expect(mockFetchConSesion).toHaveBeenCalledTimes(1);

      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        dismissNotification: jest.fn(),
        markAllRead: jest.fn(),
        lastMessageId: 'msg-1',
      });
      rerender({});
      await act(async () => {});

      expect(mockFetchConSesion).toHaveBeenCalledTimes(2);
    });

    it('does not refetch again for the same notification', async () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        unreadCount: 0,
        dismissNotification: jest.fn(),
        markAllRead: jest.fn(),
        lastMessageId: 'msg-1',
      });
      const { rerender } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});
      expect(mockFetchConSesion).toHaveBeenCalledTimes(1);

      rerender({});
      await act(async () => {});

      expect(mockFetchConSesion).toHaveBeenCalledTimes(1);
    });
  });

  describe('actualizarDespacho', () => {
    it('updates only the target despacho', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.actualizarDespacho('D1', { estado: 'finalizado' });
      });

      const updated = result.current.despachos.find((d) => d.id === 'D1');
      const unchanged = result.current.despachos.find((d) => d.id === 'D2');
      expect(updated?.estado).toBe('finalizado');
      expect(unchanged?.estado).toBe('finalizado');
    });
  });

  describe('seleccionarDespacho', () => {
    it('sets despachoActivo to the matching despacho', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.seleccionarDespacho('D1');
      });

      expect(result.current.despachoActivo?.id).toBe('D1');
    });

    it('sets despachoActivo to null for unknown id', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.seleccionarDespacho('UNKNOWN');
      });

      expect(result.current.despachoActivo).toBeNull();
    });
  });

  describe('limpiarDespachoActivo', () => {
    it('resets despachoActivo to null', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.seleccionarDespacho('D1');
      });
      act(() => {
        result.current.limpiarDespachoActivo();
      });

      expect(result.current.despachoActivo).toBeNull();
    });
  });

  describe('despachosPorPersonal', () => {
    it('returns only active despachos for the given personalId', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      const found = result.current.despachosPorPersonal('1');
      expect(found.every((d) => d.estado === 'activo')).toBe(true);
      expect(found.every((d) => d.personalIds.includes('1'))).toBe(true);
    });

    it('returns empty array when no active despacho for personalId', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      expect(result.current.despachosPorPersonal('99')).toEqual([]);
    });
  });

  describe('setDespachoActivoPorUsuario', () => {
    it('finds and sets the active despacho for personalId', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.setDespachoActivoPorUsuario('1');
      });

      expect(result.current.despachoActivo?.id).toBe('D1');
    });

    it('sets null when no active despacho found for personalId', async () => {
      const { result } = renderHook(() => useDespachos(), { wrapper });
      await act(async () => {});

      act(() => {
        result.current.setDespachoActivoPorUsuario('99');
      });

      expect(result.current.despachoActivo).toBeNull();
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useDespachos())).toThrow();
  });
});
