import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ESTADO_COLOR: Record<string, string> = {
  recibido: '#FB8C00',
  asignado: '#1976D2',
  activo: '#22c55e',
  finalizado: '#22c55e',
  cancelado: '#9E9E9E',
};

const MisDespachos = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho } = useDespachos();
  const [busqueda, setBusqueda] = useState('');

  const misDespachos = despachosPorPersonal(user?.personalId ?? '');

  const despachosFiltrados = busqueda.trim()
    ? misDespachos.filter(
        (d) =>
          d.descripcionLlamado.toLowerCase().includes(busqueda.toLowerCase()) ||
          d.direccionOrigen.toLowerCase().includes(busqueda.toLowerCase()),
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
          placeholder="Buscar por descripción o dirección..."
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
                <Text style={styles.title}>Despacho {d.id} </Text>
                <View style={[local.badge, { backgroundColor: ESTADO_COLOR[d.estado] }]}>
                  <Text style={local.badgeTexto}>
                    {d.estado[0].toUpperCase() + d.estado.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.subtitle}>
                {d.direccionOrigen} → {d.direccionDestino}
              </Text>
              <Text style={styles.subtitle}>Descripción: {d.descripcionLlamado}</Text>

              {d.ambulancia && (
                <Text style={styles.subtitle}>
                  Unidad: {d.ambulancia.modelo} — {d.ambulancia.patente}
                </Text>
              )}

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
