import { fetchConSesion } from '@/context/AuthContext';
import { SenalEquipo } from '@/data/constants/senales';

export async function enviarSenalEquipo(
  despachoId: string,
  tipo: SenalEquipo,
  grupoNombre?: string,
): Promise<void> {
  const params = new URLSearchParams({ type: tipo, despacho_id: despachoId });
  if (grupoNombre) {
    params.set('grupo_n', grupoNombre);
  }
  const response = await fetchConSesion(`/ims/api/senales/?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Error ${response.status}`);
}
