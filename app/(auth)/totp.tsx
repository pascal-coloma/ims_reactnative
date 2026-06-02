import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function TOTPScreen() {
  const router = useRouter();
  const { login, pendingCredentials, setPendingCredentials } = useAuth();
  const [totpCode, setTotpCode] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTotp(code?: string) {
    const codeToUse = code ?? totpCode;

    if (!pendingCredentials) {
      router.replace('/(auth)/login');
      return;
    }
    if (codeToUse.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const result = await login(
        pendingCredentials.username,
        pendingCredentials.password,
        codeToUse,
      );
      setPendingCredentials(null);
      if (!result) {
        setError('Error de autenticación');
        return;
      }
      if (result.role === 'medic' || result.role === 'nurse' || result.role === 'driver') {
        router.replace('/(user)/UserDashboard');
      } else if (result.role === 'control') {
        router.replace('/(admin)/AdminDashboard');
      } else {
        setError('Rol no reconocido');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación</Text>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos de tu app autenticadora</Text>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.totpInput}
        placeholder="000000"
        value={totpCode}
        onChangeText={(text) => {
          const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
          setTotpCode(clean);
          if (clean.length === 6) handleTotp(clean);
        }}
        keyboardType="numeric"
        maxLength={6}
        editable={!cargando}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, (cargando || totpCode.length !== 6) && styles.buttonDisabled]}
        onPress={() => handleTotp()}
        disabled={cargando || totpCode.length !== 6}
      >
        <Text style={styles.buttonText}>{cargando ? 'Verificando...' : 'Iniciar sesión'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setPendingCredentials(null);
          router.back();
        }}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
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
  totpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
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
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
