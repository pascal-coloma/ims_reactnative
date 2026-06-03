import { ReactNode } from 'react';
import { AmbulanciaProvider } from '@/context/AmbulanciaContext';
import { AtencionProvider } from '@/context/AtencionContext';
import DespachosProvider from '@/context/DespachosContext';
import GrupoProvider from '@/context/GrupoContext';
import InventarioProvider from '@/context/InventoryContext';
import PacienteProvider from '@/context/PacienteContext';
import PersonalProvider from '@/context/PersonalContext';

export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <DespachosProvider>
      <PersonalProvider>
        <GrupoProvider>
          <PacienteProvider>
            <AtencionProvider>
              <InventarioProvider>
                <AmbulanciaProvider>{children}</AmbulanciaProvider>
              </InventarioProvider>
            </AtencionProvider>
          </PacienteProvider>
        </GrupoProvider>
      </PersonalProvider>
    </DespachosProvider>
  );
}
