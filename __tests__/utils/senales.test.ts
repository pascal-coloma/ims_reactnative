import { enviarSenalEquipo } from '@/utils/senales';
import { SENAL_EQUIPO } from '@/data/constants/senales';

jest.mock('@/context/AuthContext', () => ({
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('enviarSenalEquipo', () => {
  it('posts to /ims/api/senales/ with type and despacho_id as query params', async () => {
    mockFetchConSesion.mockResolvedValue({ ok: true });

    await enviarSenalEquipo('54119', SENAL_EQUIPO.EN_CAMINO);

    expect(mockFetchConSesion).toHaveBeenCalledWith(
      '/ims/api/senales/?type=senal_en_camino&despacho_id=54119',
      { method: 'POST' },
    );
  });

  it('throws when the response is not ok', async () => {
    mockFetchConSesion.mockResolvedValue({ ok: false, status: 403 });

    await expect(enviarSenalEquipo('54119', SENAL_EQUIPO.DISPONIBLE)).rejects.toThrow('Error 403');
  });
});
