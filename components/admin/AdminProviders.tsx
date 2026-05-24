import DespachosProvider from '@/context/DespachosContext';
import PersonalProvider from '@/context/PersonalContext';
import PacienteProvider from '@/context/PacienteContext';
import { AtencionProvider } from '@/context/AtencionContext';
import InventarioProvider from '@/context/InventoryContext';
import { AmbulanciaProvider } from '@/context/AmbulanciaContext';

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <DespachosProvider>
      <PersonalProvider>
        <PacienteProvider>
          <AtencionProvider>
            <InventarioProvider>
              <AmbulanciaProvider>{children}</AmbulanciaProvider>
            </InventarioProvider>
          </AtencionProvider>
        </PacienteProvider>
      </PersonalProvider>
    </DespachosProvider>
  );
}
