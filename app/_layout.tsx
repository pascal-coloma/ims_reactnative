import { AuthProvider, useAuth } from '@/context/AuthContext';
import DespachosProvider from '@/context/DespachosContext';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

function RootContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DespachosProvider>
        <RootContent />
      </DespachosProvider>
    </AuthProvider>
  );
}
