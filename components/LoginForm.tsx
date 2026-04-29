import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [passw, setPassw] = useState('');

  function handleLogin() {
    const role = login(email, passw);
    if (role === 'admin') {
      router.navigate('/(admin)/AdminDashboard');
    } else if (role === 'user') {
      router.navigate('/(user)/UserDashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(newEmail) => setEmail(newEmail)}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu contraseña"
        value={passw}
        onChangeText={(newPassw) => setPassw(newPassw)}
        secureTextEntry
      />

      <TouchableOpacity>
        <Text
          style={styles.forgotPassword}
          onPress={() => {
            router.navigate('/(auth)/recuperacion');
          }}
        >
          Olvidé mi contraseña
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#E53935',
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#E53935',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
