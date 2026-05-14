import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [passw, setPassw] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !passw) {
      setError('Ingresa tus credenciales');
      return;
    }
    setCargando(true);
    setError(null);

    try {
      const result = await login(email, passw);
      if (!result) {
        setError('Credenciales incorrectas');
        return;
      }

      if (result.role === 'medic' || result.role === 'nurse') {
        router.navigate('/(user)/UserDashboard');
      } else if (result.role === 'control') {
        router.navigate('/(admin)/AdminDashboard');
      } else {
        setError('Rol no reconocido');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        editable={!cargando}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={passw}
        onChangeText={setPassw}
        secureTextEntry
        editable={!cargando}
      />

      <TouchableOpacity onPress={() => router.navigate('/(auth)/recuperacion')}>
        <Text style={styles.forgotPassword}>Olvidé mi contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>{cargando ? 'Ingresando...' : 'Iniciar sesión'}</Text>
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
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
  },
  errorTexto: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '500',
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
  buttonDisabled: {
    backgroundColor: '#EF9A9A',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
