import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import DespachosProvider from '@/context/DespachosContext';
import PacienteProvider from '@/context/PacienteContext';

const UserLayout = () => {
  const { user } = useAuth();
  if (!user || user.role !== 'user') {
    return <Redirect href={'/(auth)/login'} />;
  }

  return (
    <DespachosProvider>
      <PacienteProvider>
        <Tabs screenOptions={tabBarOptions}>
          <Tabs.Screen
            name="UserDashboard"
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
            name="RegistrarAtencion"
            options={{
              title: 'Registrar Atencion',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="person" size={size} color={color} />
              ),
            }}
          ></Tabs.Screen>
        </Tabs>
      </PacienteProvider>
    </DespachosProvider>
  );
};

export default UserLayout;

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
