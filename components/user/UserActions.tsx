import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';

const UserActions = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho } = useDespachos();

  const handleRegistrarAtencion = () => {
    const misDespachos = despachosPorPersonal(user?.personalId ?? '');

    if (misDespachos.length === 0) {
      Alert.alert('Sin despacho activo', 'No tienes un despacho activo asignado.');
      return;
    }

    const ultimo = misDespachos[misDespachos.length - 1];
    seleccionarDespacho(ultimo.id);
    router.push('/(user)/registrar-atencion');
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

        <TouchableOpacity style={style.linkStyle} onPress={handleRegistrarAtencion}>
          <View style={style.attentionCard}>
            <MaterialIcons name="checklist" size={50} color="#130b0b" />
            <View>
              <Text style={[style.cardTitle, { color: '#130b0b' }]}>Registrar Atención</Text>
              <Text style={[style.cardSubtitle, { color: '#130b0b' }]}>
                Rellenar ficha ultimo despacho
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={style.misAtencionesCard}
        onPress={() => router.push('/(user)/mis-atenciones')}
      >
        <MaterialIcons name="assignment" size={28} color="#1976D2" />
        <View>
          <Text style={style.misAtencionesTitulo}>Mis Atenciones</Text>
          <Text style={style.misAtencionesSubtitulo}>Ver y editar atenciones registradas</Text>
        </View>
      </TouchableOpacity>
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
    flex: 1,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  attentionCard: {
    backgroundColor: '#87a4cacb',
    borderRadius: 20,
    width: '100%',
    flex: 1,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  misAtencionesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    backgroundColor: '#EFF6FF',
  },
  misAtencionesTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  misAtencionesSubtitulo: {
    fontSize: 11,
    color: '#555',
  },
});
