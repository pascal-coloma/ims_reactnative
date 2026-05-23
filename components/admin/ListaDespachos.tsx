import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
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
import DetalleDespacho from './DetalleDespacho';
import { useFocusEffect } from 'expo-router';

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Recibidos', value: 'recibido' },
  { label: 'Activos', value: 'activo' },
  { label: 'Finalizados', value: 'finalizado' },
];

const ListaDespachos = () => {
  const { despachos, recargar } = useDespachos();
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  const refrescarSwipe = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  const despachosFiltrados = despachos
    .filter((d) => filtroActivo === 'todos' || d.estado === filtroActivo)
    .filter((d) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return d.rutPaciente?.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    });

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <View style={styles.container}>
            <TextInput
              style={local.buscador}
              placeholder="Buscar por RUT, nombre o ID..."
              value={busqueda}
              onChangeText={setBusqueda}
            />
            <View style={local.filtros}>
              {FILTROS.map((filtro) => (
                <TouchableOpacity key={filtro.value} onPress={() => setFiltroActivo(filtro.value)}>
                  <View>
                    <Text
                      style={filtroActivo === filtro.value ? local.pillActive : local.pillInactive}
                    >
                      {filtro.label}
                    </Text>
                    {filtroActivo === filtro.value && <View style={local.underline} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={local.divisorHeader} />
          </View>
        }
        data={despachosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DetalleDespacho despacho={item} />}
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin despachos</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refrescarSwipe} />}
      />
    </>
  );
};

const local = StyleSheet.create({
  buscador: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    width: '100%',
  },
  filtros: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 4,
  },
  divisorHeader: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginTop: 8,
  },
  pillActive: {
    color: '#E53935',
    fontWeight: '600',
    fontSize: 14,
  },
  pillInactive: {
    color: '#999',
    fontSize: 14,
  },
  underline: {
    height: 2,
    backgroundColor: '#E53935',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default ListaDespachos;
