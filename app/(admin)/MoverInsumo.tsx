import AppHeader from '@/components/AppHeader';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useInventario } from '@/context/InventoryContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MoverInsumo = () => {
  const router = useRouter();
  const { moverInsumo } = useInventario();
  const { ambulancias } = useAmbulancias();
  const { id, nombre, stock, ambulanciaId, ambulanciaPatente } = useLocalSearchParams<{
    id: string;
    nombre: string;
    stock: string;
    ambulanciaId: string;
    ambulanciaPatente: string;
  }>();

  const [destinoId, setDestinoId] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);

  const stockActual = Number(stock);
  const ambulanciasDestino = ambulancias.filter((a) => a.id !== ambulanciaId);

  const mover = async () => {
    if (!destinoId) {
      Alert.alert('Error', 'Selecciona una ambulancia de destino.');
      return;
    }
    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0.');
      return;
    }
    if (cantidadNum > stockActual) {
      Alert.alert('Error', `Stock insuficiente. Disponible: ${stockActual}`);
      return;
    }
    setLoading(true);
    try {
      await moverInsumo(Number(id), Number(ambulanciaId), Number(destinoId), cantidadNum);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo mover el insumo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Mover Insumo" />
      <ScrollView contentContainerStyle={style.container} keyboardShouldPersistTaps="handled">
        <View style={style.infoCard}>
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Insumo</Text>
            <Text style={style.infoValor}>{nombre}</Text>
          </View>
          <View style={style.divisor} />
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Origen</Text>
            <Text style={style.infoValor}>{ambulanciaPatente}</Text>
          </View>
          <View style={style.divisor} />
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Stock disponible</Text>
            <Text style={[style.infoValor, style.stockBadge]}>{stockActual} unidades</Text>
          </View>
        </View>

        <Text style={style.sectionTitle}>Ambulancia destino</Text>
        {ambulanciasDestino.length === 0 ? (
          <Text style={style.sinAmbulanciasTxt}>No hay otras ambulancias disponibles.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={style.chipsContainer}
          >
            {ambulanciasDestino.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[style.chip, destinoId === a.id && style.chipActivo]}
                onPress={() => setDestinoId(a.id)}
              >
                <Text style={[style.chipText, destinoId === a.id && style.chipTextActivo]}>
                  {a.patente}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={style.label}>Cantidad a mover</Text>
        <TextInput
          style={style.input}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          placeholder="Ej: 3"
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={[style.btnMover, loading && style.btnDisabled]}
          onPress={mover}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={style.btnMoverText}>Mover</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const style = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divisor: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  infoValor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  stockBadge: {
    color: '#E53935',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  sinAmbulanciasTxt: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#f8fafc',
  },
  btnMover: {
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnMoverText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default MoverInsumo;
