import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import GrupoProvider, { useGrupos } from '@/context/GrupoContext';
import { Grupo } from '@/data/types';

jest.mock('@/context/AuthContext', () => ({
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

const grupos: Grupo[] = [
  { grupo_id: 1, grupo_nombre: 'Equipo A', miembros: [] },
  { grupo_id: 2, grupo_nombre: 'Equipo B', miembros: [] },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GrupoProvider>{children}</GrupoProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchConSesion.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(grupos),
  });
});

describe('GrupoContext', () => {
  describe('fetchGrupos', () => {
    it('loads grupos on mount', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      expect(result.current.grupos).toEqual(grupos);
    });

    it('leaves grupos empty and logs when fetch fails', async () => {
      mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      expect(result.current.grupos).toEqual([]);
    });
  });

  describe('crearGrupo', () => {
    it('POSTs the new group and refetches the list', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      await act(async () => {
        await result.current.crearGrupo('Equipo C', [1, 2]);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/grupo/crear/', {
        method: 'POST',
        body: JSON.stringify({ nombre_grupo: 'Equipo C', personal: [1, 2] }),
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/grupo/');
    });

    it('throws the API error message on failure', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: 'Nombre duplicado' }),
      });
      await expect(
        act(async () => {
          await result.current.crearGrupo('Equipo A', [1]);
        }),
      ).rejects.toThrow('Nombre duplicado');
    });
  });

  describe('agregarMiembro', () => {
    it('POSTs to suscribir', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      await act(async () => {
        await result.current.agregarMiembro(1, 5);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/grupo/suscribir/', {
        method: 'POST',
        body: JSON.stringify({ grupo_id: 1, personal_id: 5 }),
      });
    });

    it('throws an error carrying the response status', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({}),
      });
      let caught: (Error & { status?: number }) | undefined;
      await act(async () => {
        try {
          await result.current.agregarMiembro(1, 5);
        } catch (e) {
          caught = e as Error & { status?: number };
        }
      });
      expect(caught?.status).toBe(409);
    });
  });

  describe('removerMiembro', () => {
    it('PATCHes desuscribir', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      await act(async () => {
        await result.current.removerMiembro(1, 5);
      });
      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/grupo/desuscribir/', {
        method: 'PATCH',
        body: JSON.stringify({ group_id: 1, personal_id: 5 }),
      });
    });

    it('throws on failure', async () => {
      const { result } = renderHook(() => useGrupos(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });
      await expect(
        act(async () => {
          await result.current.removerMiembro(1, 5);
        }),
      ).rejects.toThrow('Error 500');
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useGrupos())).toThrow();
  });
});
