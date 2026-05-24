import AppHeader from '@/components/AppHeader';
import { useInventario } from '@/context/InventoryContext';
import { Insumo } from '@/data/types/types';
import { memo, useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type InsumoCardProps = {
  insumo: Insumo;
  onEditar: (insumo: Insumo) => void;
  onEliminar: (id: string) => void;
};

const InsumoCard = memo(({ insumo, onEditar, onEliminar }: InsumoCardProps) => (
  <View style={style.card}>
    <View style={style.cardHeader}>
      <Text style={style.nombre}>{insumo.nombre}</Text>
      <View style={style.cardAcciones}>
        <TouchableOpacity style={style.btnEditar} onPress={() => onEditar(insumo)}>
          <Text style={style.btnEditarText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.btnEliminar} onPress={() => onEliminar(insumo.id)}>
          <Text style={style.btnEliminarText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={style.campoLabel}>Ambulancia</Text>
        <Text style={style.campoValor}>{insumo.ambulanciaPatente}</Text>
      </View>
    </View>
    <View style={style.divisorCard} />
  </View>
));

const Inventario = () => {
  const { insumos, editarInsumo, eliminarInsumo } = useInventario();
  const [modalVisible, setModalVisible] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [nombre, setNombre] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');

  const abrirModal = useCallback((insumo: Insumo) => {
    setInsumoSeleccionado(insumo);
    setNombre(insumo.nombre);
    setStock(String(insumo.stock));
    setCategoria(insumo.categoria);
    setModalVisible(true);
  }, []);

  const confirmarEdicion = useCallback(() => {
    if (!insumoSeleccionado) return;
    editarInsumo(insumoSeleccionado.id, {
      ...insumoSeleccionado,
      nombre,
      stock: Number(stock),
      categoria,
    });
    setModalVisible(false);
  }, [insumoSeleccionado, nombre, stock, categoria, editarInsumo]);

  const confirmarEliminacion = useCallback((id: string) => {
    Alert.alert('Eliminar insumo', '¿Estás seguro de eliminar este insumo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarInsumo(id) },
    ]);
  }, [eliminarInsumo]);

  const renderItem = useCallback(
    ({ item }: { item: Insumo }) => (
      <InsumoCard insumo={item} onEditar={abrirModal} onEliminar={confirmarEliminacion} />
    ),
    [abrirModal, confirmarEliminacion],
  );

  return (
    <>
      <AppHeader title="Inventario" />
      <FlatList
        data={insumos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
          onPress={() => setModalVisible(false)}
        />
        <View style={[style.modal, { paddingBottom: 24 + insets.bottom }]}>
          <Text style={style.modalTitulo}>Editar Insumo</Text>

          <Text style={style.label}>Nombre</Text>
          <TextInput style={style.input} value={nombre} onChangeText={setNombre} />

          <Text style={style.label}>Categoría</Text>
          <TextInput style={style.input} value={categoria} onChangeText={setCategoria} />

          <Text style={style.label}>Stock</Text>
          <TextInput
            style={style.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          <View style={style.modalBotones}>
            <TouchableOpacity style={style.btnCancelar} onPress={() => setModalVisible(false)}>
              <Text style={style.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={style.btnConfirmar} onPress={confirmarEdicion}>
              <Text style={style.btnConfirmarText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
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
    gap: 6,
  },
  btnEditar: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEditarText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  btnEliminar: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEliminarText: {
    color: '#dc2626',
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
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    color: '#111',
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#64748b',
    fontWeight: '600',
  },
  btnConfirmar: {
    flex: 1,
    backgroundColor: '#E53935',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConfirmarText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default Inventario;
