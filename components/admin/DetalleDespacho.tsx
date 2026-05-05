import { Despacho } from '@/data/constants/mockDespachos';
import styles from '@/styles/globalStyles';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsignarPersonalModal from './AsignarPersonalModal';

const estadoColors: Record<Despacho['estado'], string> = {
  activo: '#22c55e',
  pendiente: '#ef4444',
  completado: '#eab308',
};

const DetalleDespacho = ({ despacho }: { despacho: Despacho }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => router.push(`/(admin)/detalledespacho/${despacho.id}`)}>
        <View style={[styles.container]}>
          <Text style={[styles.title, { marginBottom: 2 }]}>DSP-{despacho.id}</Text>
          <View>
            <Text style={[styles.subtitle, { marginTop: 2 }, { fontWeight: 'bold' }]}>
              {despacho.origen}
              {` -> `}
              {despacho.destino}
            </Text>
            <Text style={[styles.subtitle, { fontWeight: 'bold' }]}>
              Paciente: {despacho.nombrePaciente}
            </Text>
            <Text style={[styles.subtitle, { fontWeight: 'bold' }]}>
              Estado:{' '}
              <Text style={{ color: estadoColors[despacho.estado] }}>
                {despacho.estado[0].toUpperCase() + despacho.estado.slice(1)}
              </Text>
            </Text>
          </View>
          <View style={{ marginLeft: 'auto' }}>
            <TouchableOpacity style={style.btnAsignar} onPress={() => setModalVisible(true)}>
              <Text style={[{ color: 'white', fontWeight: 'bold', fontSize: 16 }]}>Asignar</Text>
            </TouchableOpacity>
          </View>
          <AsignarPersonalModal visible={modalVisible} onClose={() => setModalVisible(false)} />
          <View style={style.divisor}></View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const style = StyleSheet.create({
  divisor: {
    height: 1,
    backgroundColor: 'grey',
    width: '100%',
    marginTop: 10,
  },
  btnAsignar: {
    backgroundColor: '#e60303',
    padding: 8,
    borderRadius: 10,
  },
});
export default DetalleDespacho;
