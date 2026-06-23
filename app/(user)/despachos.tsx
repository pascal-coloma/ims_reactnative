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
  const [vista, setVista] = useState<'actuales' | 'programados'>('actuales');

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

  const despachosPorVista = misDespachos.filter((d) =>
    vista === 'programados' ? !!d.fechaProgramada : !d.fechaProgramada,
  );

  const despachosFiltrados = (
    busqueda.trim()
      ? despachosPorVista.filter(
          (d) =>
            d.descripcionLlamado.toLowerCase().includes(busqueda.toLowerCase()) ||
            d.direccionOrigen.toLowerCase().includes(busqueda.toLowerCase()),
        )
      : despachosPorVista
  ).sort(
    (a, b) => new Date(b.fechaLlamado ?? 0).getTime() - new Date(a.fechaLlamado ?? 0).getTime(),
  );

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Mis Despachos" />

      <FlatList
        data={despachosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={local.tabs}>
              <TouchableOpacity
                style={[local.tab, vista === 'actuales' && local.tabActiva]}
                onPress={() => setVista('actuales')}
              >
                <Text style={[local.tabTexto, vista === 'actuales' && local.tabTextoActiva]}>
                  Actuales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[local.tab, vista === 'programados' && local.tabActiva]}
                onPress={() => setVista('programados')}
              >
                <Text style={[local.tabTexto, vista === 'programados' && local.tabTextoActiva]}>
                  Programados
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={local.buscador}
              placeholder="Buscar por descripción o dirección..."
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin despachos activos asignados</Text>
          </View>
        }
        renderItem={({ item: d, index }) => (
          <TouchableOpacity
            style={[styles.container, index % 2 === 1 && local.filaAlterna]}
            onPress={() => {
              seleccionarDespacho(d.id);
              router.push({
                pathname:
                  user?.role === 'driver' ? '/(user)/enviar-senal' : '/(user)/registrar-atencion',
                params: { despachoId: d.id },
              });
            }}
          >
            <View style={local.rowHeader}>
              <Text style={styles.title}>Despacho {d.id}</Text>
              <EstadoBadge estado={d.estado} />
            </View>
            <Text style={styles.subtitle}>
              {d.direccionOrigen} → {d.direccionDestino}
            </Text>
            {d.fechaProgramada && (
              <Text style={styles.subtitle}>
                Programado para: {new Date(d.fechaProgramada).toLocaleString('es-CL')}
              </Text>
            )}
            <Text style={styles.subtitle}>Descripción: {d.descripcionLlamado}</Text>
            {d.ambulancia && <Text style={styles.subtitle}>Unidad: {d.ambulancia.patente}</Text>}
            <View style={local.divisor} />
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refrescarSwipe} />}
      />
    </View>
  );
};

const local = StyleSheet.create({
  filaAlterna: {
    backgroundColor: '#F3F4F6',
  },
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
  tabs: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActiva: {
    backgroundColor: '#1976D2',
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  tabTextoActiva: {
    color: '#fff',
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
