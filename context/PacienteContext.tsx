import { Paciente } from '@/data/constants/mockPaciente';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchConSesion, useAuth } from './AuthContext';

type PacienteContextType = {
  pacientes: Paciente[];
  agregarPaciente: (paciente: Paciente) => void;
  buscarPaciente: (rut: string) => Paciente | undefined;
  loading: boolean;
  error: string | null;
};

const PacienteContext = createContext<PacienteContextType | null>(null);

const PacienteProvider = ({ children }: { children: ReactNode }) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchPacientes = async () => {
      setLoading(true);
      setError(null);
      try {
        // actualmente retornando 405, method not allowed
        // mover clase GetPacientes hacia RegistroPacientesAPI
        const response = await fetchConSesion('/ims/api/pacientes/get');
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setPacientes(data);
      } catch (e: any) {
        console.error('Error al hacer fetch:', e);
        setError(e.message ?? 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, [user?.role]);

  const agregarPaciente = (paciente: Paciente) => {
    setPacientes([...pacientes, paciente]);
  };

  const buscarPaciente = (rut: string) => {
    const paciente = pacientes.find((p) => p.rut == rut);
    return paciente;
  };

  return (
    <PacienteContext.Provider
      value={{ pacientes, agregarPaciente, buscarPaciente, loading, error }}
    >
      {children}
    </PacienteContext.Provider>
  );
};

export default PacienteProvider;

export function usePacientes() {
  const ctx = useContext(PacienteContext);
  if (!ctx) throw new Error('usePacientes debe usarse dentro de PacienteProvider');

  return ctx;
}
