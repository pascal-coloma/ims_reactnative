import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ListaPacientes = () => {
  const { despachos } = useDespachos();
  const [busqueda, setBusqueda] = useState('');

  const despachosFiltrados = busqueda.trim()
    ? despachos.filter(
        (d) =>
          d.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
          `${d.primerNombre} ${d.apellidoPaterno}`.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : despachos;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={local.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Listado Pacientes</Text>
        </View>
        <TextInput
          style={local.buscador}
          placeholder="Buscar por RUT o nombre..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView>
        {despachosFiltrados.length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.subtitle}>No hay pacientes registrados</Text>
          </View>
        ) : (
          despachosFiltrados.map((d) => (
            <View key={d.id} style={styles.container}>
              <Text style={styles.title}>
                {d.primerNombre} {d.segundoNombre ? `${d.segundoNombre} ` : ''}
                {d.apellidoPaterno} {d.apellidoMaterno}
              </Text>
              <Text style={styles.subtitle}>RUT: {d.rut}</Text>
              <Text style={styles.subtitle}>Edad: {d.edad} años</Text>
              <Text style={styles.subtitle}>Teléfono: {d.telefono}</Text>
              <Text style={styles.subtitle}>Origen: {d.direccionOrigen}</Text>
              <Text style={styles.subtitle}>Destino: {d.direccionDestino}</Text>
              <View style={local.divisor} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  buscador: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    width: '100%',
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
});

export default ListaPacientes;
