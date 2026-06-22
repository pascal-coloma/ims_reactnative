import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';

const UserActions = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho } = useDespachos();

  const misDespachos = despachosPorPersonal(user?.personalId ?? '');

  const handleRegistrarAtencion = () => {
    if (misDespachos.length === 0) {
      Alert.alert('Sin despacho activo', 'No tienes un despacho activo asignado.');
      return;
    }

    const ultimo = misDespachos[misDespachos.length - 1];
    seleccionarDespacho(ultimo.id);
    router.push('/(user)/registrar-atencion');
  };

  const handleEnviarSenal = () => {
    if (misDespachos.length === 0) {
      Alert.alert('Sin despacho activo', 'No tienes un despacho activo asignado.');
      return;
    }

    // Sin despachoId: la pantalla ofrece un picker para elegir el despacho,
    // a diferencia del acceso puntual desde la lista de despachos.
    router.push('/(user)/enviar-senal');
  };

  return (
    <View style={styles.container}>
      <Text style={style.title}>Acciones Rápidas</Text>
      <View style={style.cardsRow}>
        <Link href={'/(user)/despachos'} style={style.linkStyle}>
          <View style={style.dispatchCard}>
            <MaterialIcons name="airport-shuttle" size={50} color="white" />
            <View>
              <Text style={style.cardTitle}>Despachos</Text>
              <Text style={style.cardSubtitle}>Ver despachos activos</Text>
            </View>
          </View>
        </Link>

        {user?.role === 'driver' ? (
          <TouchableOpacity style={style.linkStyle} onPress={handleEnviarSenal}>
            <View style={style.ambulanciaCard}>
              <MaterialIcons name="campaign" size={50} color="white" />
              <View>
                <Text style={style.cardTitle}>Enviar señal</Text>
                <Text style={style.cardSubtitle}>Reportar estado del equipo</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={style.linkStyle} onPress={handleRegistrarAtencion}>
            <View style={style.attentionCard}>
              <MaterialIcons name="checklist" size={50} color="white" />
              <View>
                <Text style={style.cardTitle}>Registrar Atención</Text>
                <Text style={style.cardSubtitle}>Rellenar ficha ultimo despacho</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default UserActions;

const style = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'medium',
    fontSize: 18,
  },
  cardSubtitle: {
    color: 'white',
    fontWeight: 'light',
    fontSize: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  linkStyle: {
    flex: 1,
  },
  dispatchCard: {
    backgroundColor: '#E53935',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  attentionCard: {
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  ambulanciaCard: {
    backgroundColor: '#1E88E5',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
