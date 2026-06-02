import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import PersonalProvider from '@/context/PersonalContext';
import PacienteProvider from '@/context/PacienteContext';
import InventarioProvider from '@/context/InventoryContext';
import { AmbulanciaProvider } from '@/context/AmbulanciaContext';
import DespachosProvider from '@/context/DespachosContext';
import { AtencionProvider } from '@/context/AtencionContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user || user.role !== 'control') return <Redirect href={'/(auth)/login'} />;

  const tabBarOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#E53935',
    tabBarInactiveTintColor: '#999',
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      height: 60 + insets.bottom,
      paddingBottom: insets.bottom + 4,
      paddingTop: 4,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#eee',
      elevation: 8,
    },
  };

  return (
    <DespachosProvider>
      <PersonalProvider>
        <PacienteProvider>
          <AtencionProvider>
            <InventarioProvider>
              <AmbulanciaProvider>
                <Tabs screenOptions={tabBarOptions}>
                  <Tabs.Screen
                    name="AdminDashboard"
                    options={{
                      title: 'Home',
                      tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="Despachos"
                    options={{
                      title: 'Despachos',
                      tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="airport-shuttle" size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="Panel"
                    options={{
                      title: 'Panel',
                      tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="admin-panel-settings" size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="RegistrarDespacho"
                    options={{
                      href: null,
                      title: 'RegistrarDespacho',
                    }}
                  />
                  <Tabs.Screen
                    name="detalledespacho"
                    options={{
                      href: null,
                      title: 'detalledespacho',
                    }}
                  />
                  <Tabs.Screen
                    name="Inventario"
                    options={{
                      href: null,
                      title: 'Inventario',
                    }}
                  />
                  <Tabs.Screen
                    name="RegistrarWorker"
                    options={{
                      href: null,
                      title: 'RegistrarWorker',
                    }}
                  />
                  <Tabs.Screen
                    name="ListaAtenciones"
                    options={{
                      href: null,
                      title: 'ListadoAtenciones',
                    }}
                  />
                  <Tabs.Screen
                    name="ListaPersonal"
                    options={{ href: null, title: 'ListaPersonal' }}
                  />
                  <Tabs.Screen
                    name="ActualizarStock"
                    options={{ href: null, title: 'ActualizarStock' }}
                  />
                  <Tabs.Screen
                    name="MoverInsumo"
                    options={{ href: null, title: 'MoverInsumo' }}
                  />
                </Tabs>
              </AmbulanciaProvider>
            </InventarioProvider>
          </AtencionProvider>
        </PacienteProvider>
      </PersonalProvider>
    </DespachosProvider>
  );
}
