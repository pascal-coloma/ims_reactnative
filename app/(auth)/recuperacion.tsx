import RecoverConfirm from '@/components/RecoverConfirm';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  function enviarCorreo() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError('Ingresa un correo válido');
      return;
    }

    setError('');
    setEnviado(true);
  }

  if (enviado) return <RecoverConfirm email={email} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupera tu contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa el correo registrado y recibirás una nueva contraseña para recuperar tu acceso.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(newEmail) => setEmail(newEmail)}
      />
      {error ? (
        <Text style={{ color: '#E53935', fontSize: 13, marginBottom: 8 }}>{error}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={enviarCorreo}>
        <Text style={styles.buttonText}>Recuperar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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

export default RecuperarContrasena;
