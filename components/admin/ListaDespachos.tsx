import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DetalleDespacho from './DetalleDespacho';

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Activos', value: 'activo' },
  { label: 'Completados', value: 'completado' },
];

const ListaDespachos = () => {
  const { despachos } = useDespachos();
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const despachosFiltrados = despachos
    .filter((d) => filtroActivo === 'todos' || d.estado === filtroActivo)
    .filter((d) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        d.rut.toLowerCase().includes(q) ||
        d.primerNombre.toLowerCase().includes(q) ||
        d.apellidoPaterno.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    });

  return (
    <>
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

      <ScrollView>
        {despachosFiltrados.length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin despachos</Text>
          </View>
        ) : (
          despachosFiltrados.map((d) => <DetalleDespacho key={d.id} despacho={d} />)
        )}
      </ScrollView>
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