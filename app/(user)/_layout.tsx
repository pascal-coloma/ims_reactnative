import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import PacienteProvider from '@/context/PacienteContext';
import { AtencionProvider } from '@/context/AtencionContext';
import DespachosProvider from '@/context/DespachosContext';

const UserLayout = () => {
  const { user } = useAuth();
  if (!user || (user.role !== 'medic' && user.role !== 'nurse'))
    return <Redirect href={'/(auth)/login'} />;

  return (
    <DespachosProvider>
      <PacienteProvider>
        <AtencionProvider>
          <Tabs screenOptions={tabBarOptions}>
            <Tabs.Screen
              name="UserDashboard"
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
              name="RegistrarAtencion"
              options={{
                title: 'Registrar Atencion',
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="checklist" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ListaPacientes"
              options={{
                title: 'Lista Pacientes',
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="person" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="ListaAtenciones"
              options={{
                title: 'Lista Atenciones',
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="list" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </AtencionProvider>
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
