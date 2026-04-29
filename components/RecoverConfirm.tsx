import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Props = {
  email: string;
};

const RecoverConfirm = ({ email }: Props) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MaterialIcons name="check-circle" size={80} color="#22c55e" />

      <Text style={styles.tag}>¡Solicitud Enviada!</Text>
      <Text style={styles.title}>Hemos recibido tu solicitud de recuperación.</Text>
      <Text style={styles.subtitle}>
        Nuestro equipo de soporte se contactará contigo vía email en las próximas 24 horas.
      </Text>

      <View style={styles.emailBox}>
        <Text style={styles.emailLabel}>Revisa tu bandeja de entrada</Text>
        <Text style={styles.email}>Email enviado a: {email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  tag: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emailBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  emailLabel: {
    fontSize: 13,
    color: '#888',
  },
  email: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#E53935',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecoverConfirm;
