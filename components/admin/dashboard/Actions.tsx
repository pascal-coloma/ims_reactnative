import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const Actions = () => {
  return (
    <View style={styles.container}>
      <Text style={style.title}>Acciones Rápidas</Text>
      <View style={style.cardsRow}>
        <Link href={'/(admin)/despachos'} style={style.linkStyle}>
          <View style={style.dispatchCard}>
            <MaterialIcons name="airport-shuttle" size={50} color="white" />
            <View>
              <Text style={style.cardTitle}>Despachos</Text>
              <Text style={style.cardSubtitle}>Ver despachos activos</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/panel'} style={style.linkStyle}>
          <View style={style.attentionCard}>
            <MaterialIcons name="admin-panel-settings" size={50} color="#a9cbee" />
            <View>
              <Text style={[style.cardTitle, { color: 'white' }]}>Panel de Control</Text>
              <Text style={[style.cardSubtitle, { color: 'white' }]}>
                Inventario, personal y despachos
              </Text>
            </View>
          </View>
        </Link>
      </View>
    </View>
  );
};

export default Actions;

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
    backgroundColor: '#0b61d1cb',
    borderRadius: 20,
    width: '100%',
    flex: 1,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
