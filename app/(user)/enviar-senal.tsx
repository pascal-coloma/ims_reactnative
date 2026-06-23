import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import { SENAL_EQUIPO, SENAL_EQUIPO_LABEL, SenalEquipo } from '@/data/constants/senales';
import { enviarSenalEquipo } from '@/utils/senales';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EnviarSenal = () => {
  const { despachoId } = useLocalSearchParams<{ despachoId?: string }>();
  const { user } = useAuth();
  const { despachosPorPersonal } = useDespachos();

  const [despachoSeleccionadoId, setDespachoSeleccionadoId] = useState<string | null>(null);

  const misDespachos = despachosPorPersonal(user?.personalId ?? '');

  // Esta pantalla vive como tab oculto: no se desmonta entre visitas, así que
  // un useState lazy no alcanza a recoger despachoId en la segunda vez que se
  // entra desde la lista. Por eso se sincroniza con un efecto, pero SOLO
  // atado a despachoId: despachosPorPersonal devuelve un array nuevo en cada
  // render, así que si entrara en las dependencias el efecto se repetiría con
  // cada re-render (incluido el que dispara el propio picker) y pisaría la
  // selección manual del usuario. El fallback al último despacho activo se
  // resuelve más abajo con "??", no acá.
  useEffect(() => {
    setDespachoSeleccionadoId(despachoId ?? null);
  }, [despachoId]);

  const despacho =
    misDespachos.find((d) => d.id === despachoSeleccionadoId) ??
    misDespachos[misDespachos.length - 1];

  const handleEnviarSenal = async (tipo: SenalEquipo) => {
    if (!despacho) {
      Alert.alert('Sin despacho asignado', 'No tienes un despacho activo para reportar.');
      return;
    }
    try {
      await enviarSenalEquipo(despacho.id, tipo);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la señal.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Enviar señal" />
      <View style={styles.container}>
        {despacho ? (
          <Text style={local.despachoLabel}>
            Reportando sobre el despacho <Text style={local.despachoId}>{despacho.id}</Text>
          </Text>
        ) : (
          <Text style={local.despachoLabel}>Sin despacho asignado</Text>
        )}

        {misDespachos.length > 1 && (
          <View style={local.pickerContainer}>
            <Text style={local.pickerLabel}>Selecciona el despacho a reportar</Text>
            <Picker selectedValue={despacho?.id} onValueChange={setDespachoSeleccionadoId}>
              {misDespachos.map((d) => (
                <Picker.Item key={d.id} label={`Despacho ${d.id}`} value={d.id} />
              ))}
            </Picker>
          </View>
        )}

        <View style={local.cardsRow}>
          <TouchableOpacity
            style={local.linkStyle}
            onPress={() => handleEnviarSenal(SENAL_EQUIPO.EN_CAMINO)}
          >
            <View style={[local.card, local.enCaminoCard]}>
              <MaterialIcons name="directions" size={50} color="white" />
              <Text style={local.cardTitle}>{SENAL_EQUIPO_LABEL[SENAL_EQUIPO.EN_CAMINO]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={local.linkStyle}
            onPress={() => handleEnviarSenal(SENAL_EQUIPO.EN_DESTINO)}
          >
            <View style={[local.card, local.enDestinoCard]}>
              <MaterialIcons name="local-hospital" size={50} color="white" />
              <Text style={local.cardTitle}>{SENAL_EQUIPO_LABEL[SENAL_EQUIPO.EN_DESTINO]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={local.linkStyle}
            onPress={() => handleEnviarSenal(SENAL_EQUIPO.OPERANDO)}
          >
            <View style={[local.card, local.operandoCard]}>
              <MaterialIcons name="medical-services" size={50} color="white" />
              <Text style={local.cardTitle}>{SENAL_EQUIPO_LABEL[SENAL_EQUIPO.OPERANDO]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={local.linkStyle}
            onPress={() => handleEnviarSenal(SENAL_EQUIPO.REGRESANDO)}
          >
            <View style={[local.card, local.regresandoCard]}>
              <MaterialIcons name="u-turn-left" size={50} color="white" />
              <Text style={local.cardTitle}>{SENAL_EQUIPO_LABEL[SENAL_EQUIPO.REGRESANDO]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={local.linkStyle}
            onPress={() => handleEnviarSenal(SENAL_EQUIPO.DISPONIBLE)}
          >
            <View style={[local.card, local.disponibleCard]}>
              <MaterialIcons name="check-circle" size={50} color="white" />
              <Text style={local.cardTitle}>{SENAL_EQUIPO_LABEL[SENAL_EQUIPO.DISPONIBLE]}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EnviarSenal;

const local = StyleSheet.create({
  despachoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  despachoId: {
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'medium',
    fontSize: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 10,
  },
  linkStyle: {
    width: '48%',
  },
  card: {
    borderRadius: 20,
    width: '100%',
    minHeight: 110,
    gap: 10,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  enCaminoCard: {
    backgroundColor: '#1E88E5',
  },
  enDestinoCard: {
    backgroundColor: '#FB8C00',
  },
  operandoCard: {
    backgroundColor: '#00897B',
  },
  regresandoCard: {
    backgroundColor: '#8E24AA',
  },
  disponibleCard: {
    backgroundColor: '#43A047',
  },
});
