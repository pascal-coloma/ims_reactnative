import { useAtenciones } from '@/context/AtencionContext';
import styles from '@/styles/globalStyles';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ListaPacientes = () => {
  const { atenciones } = useAtenciones();
  const [busqueda, setBusqueda] = useState('');

  const pacientesFiltrados = busqueda.trim()
    ? atenciones.filter((a) => a.paciente.rut.toLowerCase().includes(busqueda.toLowerCase()))
    : atenciones;

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
          placeholder="Buscar por RUT..."
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
          pacientesFiltrados.map((a) => (
            <View key={a.id} style={styles.container}>
              <Text style={styles.title}>
                {a.paciente.primerNombre} {a.paciente.apellidoPaterno} {a.paciente.apellidoMaterno}
              </Text>
              <Text style={styles.subtitle}>RUT: {a.paciente.rut}</Text>
              <Text style={styles.subtitle}>Edad: {a.paciente.edad} años</Text>
              <Text style={styles.subtitle}>Teléfono: {a.paciente.telefono}</Text>
              <Text style={styles.subtitle}>
                Registrado: {new Date(a.fechaRegistro).toLocaleDateString('es-CL')}
              </Text>
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
    width: '100%'
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
