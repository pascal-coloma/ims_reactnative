import AppHeader from '@/components/AppHeader';
import { useInventario } from '@/context/InventoryContext';
import { Insumo } from '@/data/types';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

const Inventario = () => {
  const { insumos } = useInventario();
  const router = useRouter();
  const [ambulanciaSeleccionada, setAmbulanciaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const patentes = useMemo(() => {
    const unique = Array.from(new Set(insumos.map((i) => i.ambulanciaPatente)));
    return unique.sort((a, b) => {
      const aIsBodega = /bodega/i.test(a);
      const bIsBodega = /bodega/i.test(b);
      if (aIsBodega && !bIsBodega) return -1;
      if (!aIsBodega && bIsBodega) return 1;
      return 0;
    });
  }, [insumos]);

  const seleccion = useMemo(
    () => ambulanciaSeleccionada || patentes[0],
    [ambulanciaSeleccionada, patentes],
  );

  const insumosFiltrados = useMemo(() => {
    const porAmbulancia = insumos.filter((i) => i.ambulanciaPatente === seleccion);
    if (!busqueda.trim()) return porAmbulancia;
    const termino = busqueda.trim().toLowerCase();
    return porAmbulancia.filter((i) => i.nombre.toLowerCase().includes(termino));
  }, [insumos, seleccion, busqueda]);

  const chipSelector = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style.selectorScroll}
        contentContainerStyle={style.selectorContainer}
      >
        {patentes.map((patente) => (
          <TouchableOpacity
            key={patente}
            style={[style.chip, seleccion === patente && style.chipActivo]}
            onPress={() => {
              setAmbulanciaSeleccionada(patente);
              setBusqueda('');
            }}
          >
            <Text style={[style.chipText, seleccion === patente && style.chipTextActivo]}>
              {patente}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TextInput
        style={style.buscador}
        placeholder="Buscar insumo..."
        placeholderTextColor="#aaa"
        value={busqueda}
        onChangeText={setBusqueda}
        clearButtonMode="while-editing"
      />
    </View>
  );

  const renderInsumo = ({ item: insumo, index }: { item: Insumo; index: number }) => (
    <View style={[style.card, { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }]}>
      <View style={style.cardHeader}>
        <Text style={style.nombre}>{insumo.nombre}</Text>
      </View>
      <View style={style.cardBody}>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Categoría</Text>
          <Text style={style.campoValor}>{insumo.categoria}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Stock</Text>
          <Text style={style.campoValor}>{insumo.stock} unidades</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Presentación</Text>
          <Text style={style.campoValor}>
            {insumo.cantidad} {insumo.unidadMedida}
          </Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>
            {/bodega/i.test(insumo.ambulanciaPatente) ? 'Ubicación' : 'Ambulancia'}
          </Text>
          <Text style={style.campoValor}>{insumo.ambulanciaPatente}</Text>
        </View>
      </View>
      <View style={style.cardAcciones}>
        <TouchableOpacity
          style={style.btnActualizar}
          onPress={() =>
            router.push({
              pathname: '/(admin)/ActualizarStock',
              params: {
                id: insumo.id,
                nombre: insumo.nombre,
                stock: String(insumo.stock),
                ambulanciaId: String(insumo.ambulanciaId),
                ambulanciaPatente: insumo.ambulanciaPatente,
              },
            })
          }
        >
          <Text style={style.btnActualizarText}>Actualizar Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.btnMover}
          onPress={() =>
            router.push({
              pathname: '/(admin)/MoverInsumo',
              params: {
                id: insumo.id,
                nombre: insumo.nombre,
                stock: String(insumo.stock),
                ambulanciaId: String(insumo.ambulanciaId),
                ambulanciaPatente: insumo.ambulanciaPatente,
              },
            })
          }
        >
          <Text style={style.btnMoverText}>Mover</Text>
        </TouchableOpacity>
      </View>
      <View style={style.divisorCard} />
    </View>
  );

  return (
    <>
      <AppHeader title="Inventario" />
      <FlatList
        data={insumosFiltrados}
        keyExtractor={(item, i) => `${item.ambulanciaPatente}-${item.id}-${i}`}
        renderItem={renderInsumo}
        ListHeaderComponent={chipSelector}
        stickyHeaderIndices={[0]}
      />
    </>
  );
};

const style = StyleSheet.create({
  selectorScroll: {
    flexShrink: 0,
    backgroundColor: '#fff',
  },
  buscador: {
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: 14,
    color: '#111',
  },
  selectorContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  chipActivo: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  chipTextActivo: {
    color: '#fff',
  },
  card: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  cardAcciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  btnActualizar: {
    flex: 1,
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnActualizarText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  btnMover: {
    flex: 1,
    backgroundColor: '#fef9c3',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnMoverText: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '600',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },
  cardBody: { gap: 4 },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  campoLabel: { color: '#888', fontSize: 13 },
  campoValor: { fontSize: 13, fontWeight: '500', color: '#111' },
  divisorCard: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 12,
  },
});

export default Inventario;
