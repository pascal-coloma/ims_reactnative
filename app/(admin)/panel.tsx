import AppHeader from '@/components/AppHeader';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useDespachos } from '@/context/DespachosContext';
import { usePersonal } from '@/context/PersonalContext';
import { AMBULANCIA_ESTADO } from '@/data/constants/ambulanciaEstados';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

const Panel = () => {
  const { despachos, loading: loadingDespachos } = useDespachos();
  const { personal } = usePersonal();
  const { ambulancias } = useAmbulancias();
  const totalDespachos = despachos.length;
  const movilesActivos = ambulancias.filter(
    (p) => p.estado === AMBULANCIA_ESTADO.DISPONIBLE,
  ).length;
  const personalActivo = personal.filter((p) => p.is_active).length;

  return (
    <>
      <AppHeader title="Panel de Control" />
      <ScrollView contentContainerStyle={{ gap: 10, padding: 10, backgroundColor: 'white' }}>
        <View style={style.contenedorCards}>
          <View style={style.statCard}>
            <Text style={style.cardTitle}>{`Despachos (activos/totales)`}</Text>
            {loadingDespachos ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={style.cardSubtitle}>{totalDespachos}</Text>
            )}
          </View>
          <View style={[style.statCard, { borderLeftColor: '#E53935' }]}>
            <Text style={style.cardTitle}>Ambulancias</Text>
            <Text style={style.cardSubtitle}>{movilesActivos}</Text>
          </View>
        </View>
        <View style={style.contenedorCards}>
          <View style={style.personalCard}>
            <Text style={style.cardTitle}>Personal registrado</Text>
            <Text style={style.cardSubtitle}>{personalActivo}</Text>
          </View>
        </View>
        <Text style={[style.title, { backgroundColor: 'white' }]}>Acciones Rápidas</Text>
        <Link href={'/(admin)/registrar-despacho'}>
          <View style={style.patientCard}>
            <MaterialIcons name="checklist" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Registrar Despacho</Text>
              <Text>Nuevo llamado - crear despacho</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/registrar-worker'}>
          <View style={style.patientCard}>
            <MaterialIcons name="input" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Registrar Trabajador</Text>
              <Text>Crear perfil de usuario</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/lista-personal'}>
          <View style={style.patientCard}>
            <MaterialIcons name="person" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Personal</Text>
              <Text>Listado de personal activo</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/despachos'}>
          <View style={style.patientCard}>
            <MaterialIcons name="airport-shuttle" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Despachos</Text>
              <Text>Lista de despachos</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/lista-atenciones'}>
          <View style={style.patientCard}>
            <MaterialIcons name="list" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Atenciones</Text>
              <Text>Descarga documentos de atención</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/inventario'}>
          <View style={style.patientCard}>
            <MaterialIcons name="inventory" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Inventario</Text>
              <Text>Gestión de Inventario</Text>
            </View>
          </View>
        </Link>
        <Link href={'/(admin)/grupos'}>
          <View style={style.patientCard}>
            <MaterialIcons name="group" size={40} color="#372121" />
            <View style={{ padding: 5 }}>
              <Text style={[style.cardTitle, { color: '#372121' }]}>Ver Grupos</Text>
              <Text>Gestión de grupos de trabajo</Text>
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
  statCard: {
    backgroundColor: '#e62a2af3',
    borderRadius: 20,
    flex: 1,
    gap: 10,
    padding: 10,
  },
  personalCard: {
    backgroundColor: '#0b61d1cb',
    borderRadius: 20,
    gap: 10,
    padding: 10,
    width: '50%',
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
