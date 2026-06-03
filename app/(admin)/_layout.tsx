import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import AdminProviders from '@/components/admin/AdminProviders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user || user.role !== 'control') return <Redirect href={'/(auth)/login'} />;

  const tabBarOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#E53935',
    tabBarInactiveTintColor: '#999',
    tabBarHideOnKeyboard: false,
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
    <AdminProviders>
      <Tabs screenOptions={tabBarOptions}>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="despachos"
          options={{
            title: 'Despachos',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="airport-shuttle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="panel"
          options={{
            title: 'Panel',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="registrar-despacho" options={{ href: null, title: 'RegistrarDespacho' }} />
        <Tabs.Screen name="detalledespacho" options={{ href: null, title: 'detalledespacho' }} />
        <Tabs.Screen name="inventario" options={{ href: null, title: 'Inventario' }} />
        <Tabs.Screen name="registrar-worker" options={{ href: null, title: 'RegistrarWorker' }} />
        <Tabs.Screen name="lista-atenciones" options={{ href: null, title: 'ListadoAtenciones' }} />
        <Tabs.Screen name="lista-personal" options={{ href: null, title: 'ListaPersonal' }} />
        <Tabs.Screen name="actualizar-stock" options={{ href: null, title: 'ActualizarStock' }} />
        <Tabs.Screen name="mover-insumo" options={{ href: null, title: 'MoverInsumo' }} />
        <Tabs.Screen
          name="grupos"
          options={{
            title: 'Grupos',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="group" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="crear-grupo" options={{ href: null, title: 'CrearGrupo' }} />
        <Tabs.Screen name="(grupo)" options={{ href: null, title: 'grupo' }} />
      </Tabs>
    </AdminProviders>
  );
}
