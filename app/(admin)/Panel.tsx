import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useDespachos } from '@/context/DespachosContext';
import { usePersonal } from '@/context/PersonalContext';
import { mockAmbulancias } from '@/data/constants/mockAmbulancia';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Panel = () => {
  const { despachos } = useDespachos();
  const { personal } = usePersonal();
  const { ambulancias } = useAmbulancias();
  const totalDespachos = despachos.length;
  const movilesActivos = ambulancias.filter((p) => p.estado_disponibilidad == "disponible").length;
  const personalActivo = personal.filter((p) => p.is_active).length;

  return (
    <>
      <View style={styles.container}>
        <View style={style.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Panel de Control</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ gap: 10, padding: 10, backgroundColor: 'white' }}>
        <View style={style.contenedorCards}>
          <View style={style.statCard}>
            <Text style={style.cardTitle}>Despachos hoy</Text>
            <Text style={style.cardSubtitle}>{totalDespachos}</Text>
          </View>
          <View style={[style.statCard, { borderLeftColor: '#E53935' }]}>
            <Text style={style.cardTitle}>Moviles</Text>
            <Text style={style.cardSubtitle}>{movilesActivos}</Text>
          </View>
        </View>
        <View style={style.contenedorCards}>
          <View style={style.personalCard}>
            <Text style={style.cardTitle}>Personal activo</Text>
            <Text style={style.cardSubtitle}>{personalActivo}</Text>
          </View>
        </View>
        <Text style={[style.title, { backgroundColor: 'white' }]}>Acciones Rapidas</Text>
        <Link href={'/(admin)/RegistrarPaciente'}>
          <View style={style.patientCard}>
            <MaterialIcons name="person" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Registrar Paciente</Text>
              <Text>Nuevo llamado - crear despacho</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/Despachos'}>
          <View style={style.patientCard}>
            <MaterialIcons name="airport-shuttle" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Despachos</Text>
              <Text>Lista de despachos</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/Inventario'}>
          <View style={style.patientCard}>
            <MaterialIcons name="inventory" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Inventario</Text>
              <Text>Gestión de Inventario</Text>
            </View>
          </View>
        </Link>
      </ScrollView>
    </>
  );
};

const style = StyleSheet.create({
  contenedorCards: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 10,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'medium',
    fontSize: 18,
  },
  cardSubtitle: {
    color: 'white',
    fontWeight: 'light',
    fontSize: 35,
  },
  cardsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  linkStyle: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
  statCard: {
    backgroundColor: '#e62a2af3',
    borderRadius: 20,
    flex: 1,
    gap: 10,
    padding: 10,
  },
  personalCard: {
    backgroundColor: '#87a4cacb',
    borderRadius: 20,
    gap: 10,
    padding: 10,
    width: '50%',
  },
  attentionCard: {
    backgroundColor: '#dfacab5b',
    borderRadius: 20,
    width: '100%',
    flex: 1,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  patientCard: {
    backgroundColor: '#ddcdcd5b',
    borderRadius: 20,
    gap: 10,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Panel;
