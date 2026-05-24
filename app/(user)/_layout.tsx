import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { AtencionProvider } from '@/context/AtencionContext';
import DespachosProvider from '@/context/DespachosContext';
import InventarioProvider from '@/context/InventoryContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const UserLayout = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user || (user.role !== 'medic' && user.role !== 'nurse' && user.role !== 'driver'))
    return <Redirect href={'/(auth)/login'} />;

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
    <InventarioProvider>
      <DespachosProvider>
        <AtencionProvider>
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
              name="registrar-atencion"
              options={{
                title: 'Registrar Atencion',
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="checklist" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </AtencionProvider>
      </DespachosProvider>
    </InventarioProvider>
  );
};

export default UserLayout;
