import { useInventario } from '@/context/InventoryContext';
import { Insumo } from '@/data/constants/mockInventario';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Bodega', value: 'bodega' },
  { label: 'Ambulancia', value: 'ambulancia' },
];

const Inventario = () => {
  const { insumos, buscarInsumo, editarInsumo, eliminarInsumo } = useInventario();
  const [activeFilter, setActiveFilter] = useState('todos');
  const insumosFiltrados = activeFilter === 'todos' ? insumos : buscarInsumo(activeFilter);
  const [modalVisible, setModalVisible] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  const [nombre, setNombre] = useState('');
  const [stockTotal, setStockTotal] = useState('');
  const [tipo, setTipo] = useState('');

  const abrirModal = (insumo: Insumo) => {
    setInsumoSeleccionado(insumo);
    setNombre(insumo.nombre);
    setStockTotal(String(insumo.stockTotal));
    setTipo(insumo.tipo);
    setModalVisible(true);
  };

  const confirmarEdicion = () => {
    if (!insumoSeleccionado) return;
    const insumoActualizado: Insumo = {
      ...insumoSeleccionado,
      nombre,
      stockTotal: Number(stockTotal),
      tipo,
    };
    editarInsumo(insumoSeleccionado.id, insumoActualizado);
    setModalVisible(false);
  };

  const confirmarEliminacion = (id: string) => {
    Alert.alert('Eliminar insumo', '¿Estás seguro de eliminar este insumo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarInsumo(id) },
    ]);
    console.log('pressed');
  };
  return (
    <>
      <View style={styles.container}>
        <View style={style.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Inventario</Text>
        </View>
        <View style={style.filtros}>
          {FILTROS.map((filtro) => (
            <TouchableOpacity key={filtro.label} onPress={() => setActiveFilter(filtro.value)}>
              <View>
                <Text style={activeFilter === filtro.value ? style.pillActive : style.pillInactive}>
                  {filtro.label}
                </Text>
                {filtro.value === activeFilter && <View style={style.underline} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={style.divisor} />
      </View>

      <ScrollView>
        <View>
          {insumosFiltrados.map((insumo) => (
            <View key={insumo.id} style={style.card}>
              <View style={style.cardHeader}>
                <Text style={style.nombre}>{insumo.nombre}</Text>
                <View style={style.cardAcciones}>
                  <TouchableOpacity style={style.btnEditar} onPress={() => abrirModal(insumo)}>
                    <Text style={style.btnEditarText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={style.btnEliminar}
                    onPress={() => confirmarEliminacion(insumo.id)}
                  >
                    <Text style={style.btnEliminarText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={[
                  style.ubicacionPill,
                  insumo.ubicacion === 'ambulancia' ? style.pillAmbulancia : style.pillBodega,
                ]}
              >
                <Text style={style.ubicacionText}>{insumo.ubicacion}</Text>
              </View>
              <View style={style.cardBody}>
                <View style={style.campo}>
                  <Text style={style.campoLabel}>Tipo</Text>
                  <Text style={style.campoValor}>{insumo.tipo}</Text>
                </View>
                <View style={style.campo}>
                  <Text style={style.campoLabel}>Stock</Text>
                  <Text
                    style={[
                      style.campoValor,
                      insumo.stockTotal <= insumo.stockMinimo && { color: '#ef4444' },
                    ]}
                  >
                    {insumo.stockTotal} {insumo.unidadMedida}
                  </Text>
                </View>
                <View style={style.campo}>
                  <Text style={style.campoLabel}>Stock mínimo</Text>
                  <Text style={style.campoValor}>
                    {insumo.stockMinimo} {insumo.unidadMedida}
                  </Text>
                </View>
              </View>
              <View style={style.divisorCard} />
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
          onPress={() => setModalVisible(false)}
        />
        <View style={style.modal}>
          <Text style={style.modalTitulo}>Editar Insumo</Text>

          <Text style={style.label}>Nombre</Text>
          <TextInput style={style.input} value={nombre} onChangeText={setNombre} />

          <Text style={style.label}>Tipo</Text>
          <TextInput style={style.input} value={tipo} onChangeText={setTipo} />

          <Text style={style.label}>Stock total</Text>
          <TextInput
            style={style.input}
            value={stockTotal}
            onChangeText={setStockTotal}
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
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
  filtros: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 5,
  },
  divisor: {
    height: 1,
    width: '100%',
    backgroundColor: '#5a444452',
  },
  pillActive: { color: '#E53935' },
  pillInactive: { color: 'grey' },
  underline: {
    height: 2,
    backgroundColor: '#E53935',
    borderRadius: 2,
    marginTop: 4,
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
  ubicacionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  pillAmbulancia: { backgroundColor: '#dbeafe' },
  pillBodega: { backgroundColor: '#dcfce7' },
  ubicacionText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
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
