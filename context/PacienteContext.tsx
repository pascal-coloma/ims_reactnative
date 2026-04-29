import mockPacientes, { Paciente } from '@/constants/mockPaciente';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type PacienteContextType = {
  pacientes: Paciente[];
  agregarPaciente: (paciente: Paciente) => void;
  buscarPaciente: (rut: string) => Paciente | undefined;
};

const PacienteContext = createContext<PacienteContextType | null>(null);

const PacienteProvider = ({ children }: { children: ReactNode }) => {
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);

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
