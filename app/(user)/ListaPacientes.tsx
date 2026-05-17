import { useDespachos } from '@/context/DespachosContext';
import { usePacientes } from '@/context/PacienteContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ListaPacientes = () => {
  const { pacientes } = usePacientes();
  const [busqueda, setBusqueda] = useState('');
  const pacientesFiltrados = busqueda.trim()
    ? pacientes.filter((p) =>
        p.rut.replace(/\./g, '').toLowerCase().includes(busqueda.replace(/\./g, '').toLowerCase()),
      )
    : pacientes;

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
        {pacientesFiltrados.length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.subtitle}>No hay pacientes registrados</Text>
          </View>
        ) : (
          pacientesFiltrados.map((d) => (
            <View key={d.rut} style={styles.container}>
              <Text style={styles.title}>{d.nombre_completo}</Text>
              <Text style={styles.subtitle}>RUT: {d.rut}</Text>
              <Text style={styles.subtitle}>Fecha Nacimiento: {d.fecha_nacimiento}</Text>
              <Text style={styles.subtitle}>Teléfono: {d.telefono}</Text>
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
