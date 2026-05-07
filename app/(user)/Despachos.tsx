import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: '#E53935',
  media: '#FB8C00',
  baja: '#43A047',
};

const MisDespachos = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho } = useDespachos();
  const [busqueda, setBusqueda] = useState('');

  const misDespachos = despachosPorPersonal(user?.personalId ?? '');

  const despachosFiltrados = busqueda.trim()
    ? misDespachos.filter(
        (d) =>
          d.primerNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          d.rut.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : misDespachos;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={local.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Mis Despachos</Text>
        </View>
        <TextInput
          style={local.buscador}
          placeholder="Buscar por paciente o RUT..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView>
        {despachosFiltrados.length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin despachos activos asignados</Text>
          </View>
        ) : (
          despachosFiltrados.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.container}
              onPress={() => {
                seleccionarDespacho(d.id);
                router.push('/(user)/RegistrarAtencion');
              }}
            >
              <View style={local.rowHeader}>
                <Text style={styles.title}>
                  {[d.primerNombre, d.segundoNombre, d.apellidoPaterno, d.apellidoMaterno]
                    .filter(Boolean)
                    .join(' ')}
                </Text>
                <View style={[local.badge, { backgroundColor: PRIORIDAD_COLOR[d.prioridad] }]}>
                  <Text style={local.badgeTexto}>{d.prioridad.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>RUT: {d.rut}</Text>
              <Text style={styles.subtitle}>Edad: {d.edad} años</Text>
              <Text style={styles.subtitle}>
                {d.direccionOrigen} → {d.direccionDestino}
              </Text>
              <Text style={styles.subtitle}>Emergencia: {d.tipoEmergencia}</Text>

              {d.ambulancia && (
                <Text style={styles.subtitle}>
                  Unidad: {d.ambulancia.modelo} — {d.ambulancia.patente}
                </Text>
              )}

              {d.observaciones && <Text style={styles.subtitle}>Obs: {d.observaciones}</Text>}

              <View style={local.divisor} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    width: '100%',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexto: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginTop: 10,
  },
});

export default MisDespachos;
