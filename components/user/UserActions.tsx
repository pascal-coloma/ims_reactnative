import { Link, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useDespachos } from '@/context/DespachosContext';
import { AMBULANCIA_ESTADO, AmbulanciaEstado } from '@/data/constants/ambulanciaEstados';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';

const UserActions = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho } = useDespachos();
  const { cambiarEstado } = useAmbulancias();
  const [ambulanciaSeleccionadaId, setAmbulanciaSeleccionadaId] = useState<string | null>(null);

  const misDespachos = despachosPorPersonal(user?.personalId ?? '');

  const ambulanciasAsignadas = misDespachos.reduce<{ id: string; patente: string }[]>((acc, d) => {
    if (d.ambulancia && !acc.some((a) => a.id === d.ambulancia!.id)) acc.push(d.ambulancia);
    return acc;
  }, []);

  const ultimaAmbulancia = misDespachos[misDespachos.length - 1]?.ambulancia;
  const miAmbulanciaId = ambulanciaSeleccionadaId ?? ultimaAmbulancia?.id;
  const miAmbulancia =
    ambulanciasAsignadas.find((a) => a.id === miAmbulanciaId) ?? ultimaAmbulancia;

  const handleRegistrarAtencion = () => {
    if (misDespachos.length === 0) {
      Alert.alert('Sin despacho activo', 'No tienes un despacho activo asignado.');
      return;
    }

    const ultimo = misDespachos[misDespachos.length - 1];
    seleccionarDespacho(ultimo.id);
    router.push('/(user)/registrar-atencion');
  };

  const handleCambiarEstadoAmbulancia = async (estado: AmbulanciaEstado) => {
    if (!miAmbulanciaId) {
      Alert.alert(
        'Sin ambulancia asignada',
        'No tienes un despacho activo con ambulancia asignada.',
      );
      return;
    }
    try {
      await cambiarEstado(miAmbulanciaId, estado);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado de la ambulancia.');
    }
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

        {user?.role !== 'driver' && (
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
        )}
      </View>

      {user?.role === 'driver' && (
        <>
          {ambulanciasAsignadas.length > 1 ? (
            <View style={style.pickerContainer}>
              <Text style={style.ambulanciaLabel}>Selecciona la ambulancia a actualizar</Text>
              <Picker selectedValue={miAmbulanciaId} onValueChange={setAmbulanciaSeleccionadaId}>
                {ambulanciasAsignadas.map((a) => (
                  <Picker.Item key={a.id} label={a.patente} value={a.id} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={style.ambulanciaLabel}>
              {miAmbulancia ? (
                <>
                  Cambiando estado de{' '}
                  <Text style={style.ambulanciaPatente}>{miAmbulancia.patente}</Text>
                </>
              ) : (
                'Sin ambulancia asignada'
              )}
            </Text>
          )}
          <View style={style.cardsRow}>
            <TouchableOpacity
              style={style.linkStyle}
              onPress={() => handleCambiarEstadoAmbulancia(AMBULANCIA_ESTADO.ENPREPARACION)}
            >
              <View style={style.preparacionCard}>
                <MaterialIcons name="build" size={50} color="white" />
                <View>
                  <Text style={style.cardTitle}>En preparación</Text>
                  <Text style={style.cardSubtitle}>Cargando combustible, insumos, etc.</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={style.linkStyle}
              onPress={() => handleCambiarEstadoAmbulancia(AMBULANCIA_ESTADO.DISPONIBLE)}
            >
              <View style={style.disponibleCard}>
                <MaterialIcons name="check-circle" size={50} color="white" />
                <View>
                  <Text style={style.cardTitle}>Disponible</Text>
                  <Text style={style.cardSubtitle}>Lista para operar</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  ambulanciaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  ambulanciaPatente: {
    fontWeight: 'bold',
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
    backgroundColor: '#87a4cacb',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  preparacionCard: {
    backgroundColor: '#FB8C00',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  disponibleCard: {
    backgroundColor: '#43A047',
    borderRadius: 20,
    width: '100%',
    minHeight: 100,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
