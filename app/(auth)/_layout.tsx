import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="recuperacion"
          options={{
            headerShown: true,
            headerTitle: '',
            headerTintColor: '#0e0606',
          }}
        />
      </Stack>
    </>
  );
}
