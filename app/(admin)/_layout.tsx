import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import PersonalProvider from '@/context/PersonalContext';
import PacienteProvider from '@/context/PacienteContext';
import InventarioProvider from '@/context/InventoryContext';
import { AmbulanciaProvider } from '@/context/AmbulanciaContext';
import DespachosProvider from '@/context/DespachosContext';

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user || user.role !== 'control') return <Redirect href={'/(auth)/login'} />;

  return (
    <DespachosProvider>
      <PersonalProvider>
        <PacienteProvider>
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
                ></Tabs.Screen>
                <Tabs.Screen
                  name="Despachos"
                  options={{
                    title: 'Despachos',
                    tabBarIcon: ({ color, size }) => (
                      <MaterialIcons name="airport-shuttle" size={size} color={color} />
                    ),
                  }}
                ></Tabs.Screen>
                <Tabs.Screen
                  name="Panel"
                  options={{
                    title: 'Panel',
                    tabBarIcon: ({ color, size }) => (
                      <MaterialIcons name="admin-panel-settings" size={size} color={color} />
                    ),
                  }}
                ></Tabs.Screen>
                <Tabs.Screen
                  name="RegistrarDespacho"
                  options={{
                    href: null,
                    title: 'RegistrarDespacho',
                  }}
                ></Tabs.Screen>
                <Tabs.Screen
                  name="detalledespacho"
                  options={{
                    href: null,
                    title: 'detalledespacho',
                  }}
                ></Tabs.Screen>
                <Tabs.Screen
                  name="Inventario"
                  options={{
                    href: null,
                    title: 'Inventario',
                  }}
                ></Tabs.Screen>
              </Tabs>
            </AmbulanciaProvider>
          </InventarioProvider>
        </PacienteProvider>
      </PersonalProvider>
    </DespachosProvider>
  );
}

const tabBarOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#E53935',
  tabBarInactiveTintColor: '#999',
  tabBarStyle: {
    height: 60,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
};
