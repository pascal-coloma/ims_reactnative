import { fetchConSesion } from '@/context/AuthContext';
import { SenalEquipo } from '@/data/constants/senales';

export async function enviarSenalEquipo(despachoId: string, tipo: SenalEquipo): Promise<void> {
  const params = new URLSearchParams({ type: tipo, despacho_id: despachoId });
  const response = await fetchConSesion(`/ims/api/senales/?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Error ${response.status}`);
}
