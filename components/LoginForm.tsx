import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginForm() {
  const router = useRouter();
  const { setPendingCredentials, verifyPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [passw, setPassw] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatearRut = (rut: string): string => {
    const clean = rut.replace(/[^0-9kK]/g, '').slice(0, 9);
    if (clean.length <= 1) return clean;
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  async function handleLogin() {
    if (!username || !passw) {
      setError('Ingresa tus credenciales');
      return;
    }
    setCargando(true);
    setError(null);

    try {
      // TODO: /ims/api/verify-password/ 
      // const ok = await verifyPassword(username.replace(/\./g, ''), passw);
      // if (!ok) {
      //   setError('Credenciales incorrectas');
      //   return;
      // }

      setPendingCredentials({ username: username.replace(/\./g, ''), password: passw });
      router.push('/(auth)/totp');
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
        placeholder="RUT (12.345.678-9)"
        value={username}
        autoCapitalize="none"
        onChangeText={(text) => setUsername(text)}
        editable={!cargando}
        keyboardType="default"
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
