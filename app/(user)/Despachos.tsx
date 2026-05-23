import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EstadoBadge from '@/components/EstadoBadge';

const MisDespachos = () => {
  const { user } = useAuth();
  const { despachosPorPersonal, seleccionarDespacho, recargar } = useDespachos();
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, []),
  );

  const refrescarSwipe = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

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
      <AppHeader title="Mis Despachos" />

      <FlatList
        data={despachosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TextInput
            style={local.buscador}
            placeholder="Buscar por descripción o dirección..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
        }
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin despachos activos asignados</Text>
          </View>
        }
        renderItem={({ item: d }) => (
          <TouchableOpacity
            style={styles.container}
            onPress={() => {
              seleccionarDespacho(d.id);
              router.push('/(user)/RegistrarAtencion');
            }}
          >
            <View style={local.rowHeader}>
              <Text style={styles.title}>Despacho {d.id}</Text>
              <EstadoBadge estado={d.estado} />
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
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refrescarSwipe} />}
      />
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
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
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
