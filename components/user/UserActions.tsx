import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const UserActions = () => {
  return (
    <>
      <View style={styles.container}>
        <Text style={style.title}>Acciones Rápidas</Text>
        <View style={style.cardsRow}>
          <Link href={'/(user)/Despachos'} style={style.linkStyle}>
            <View style={style.dispatchCard}>
              <MaterialIcons name="airport-shuttle" size={50} color="white" />
              <View>
                <Text style={style.cardTitle}>Despachos</Text>
                <Text style={style.cardSubtitle}>Ver despachos activos</Text>
              </View>
            </View>
          </Link>
          <Link href={'/(user)/RegistrarAtencion'} style={style.linkStyle}>
            <View style={style.attentionCard}>
              <MaterialIcons name="checklist" size={50} color="#130b0b" />
              <View>
                <Text style={[style.cardTitle, { color: '#130b0b' }]}>Registrar Atencion</Text>
                <Text style={[style.cardSubtitle, { color: '#130b0b' }]}>
                  Ficha prehospitalaria
                </Text>
              </View>
            </View>
          </Link>
        </View>
      </View>
    </>
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
});
