import mockPacientes, { Paciente } from '@/data/constants/mockPaciente';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchConSesion, useAuth } from './AuthContext';

type PacienteContextType = {
  pacientes: Paciente[];
  agregarPaciente: (paciente: Paciente) => void;
  buscarPaciente: (rut: string) => Paciente | undefined;
};

const PacienteContext = createContext<PacienteContextType | null>(null);

const PacienteProvider = ({ children }: { children: ReactNode }) => {
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchConSesion('/ims/api/pacientes');
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setPacientes(data);
      } catch (e: any) {
        console.error('Error al hacer fetch' + e);
        setError(e.message ?? 'Error desconocido');
      }
    };
    fetchPacientes();
  }, []);

  const agregarPaciente = (paciente: Paciente) => {
    setPacientes([...pacientes, paciente]);
  };

  const buscarPaciente = (rut: string) => {
    const paciente = pacientes.find((p) => p.rut == rut);
    return paciente;
  };

  return (
    <PacienteContext.Provider value={{ pacientes, agregarPaciente, buscarPaciente }}>
      {children}
    </PacienteContext.Provider>
  );
};

export default PacienteProvider;

export function usePacientes() {
  const ctx = useContext(PacienteContext);
  if (!ctx) throw new Error('useContext debe usarse dentro de PersonalProvider');
  return ctx;
}
