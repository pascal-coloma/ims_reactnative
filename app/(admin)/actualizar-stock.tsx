import AppHeader from '@/components/AppHeader';
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

const ActualizarStock = () => {
  const router = useRouter();
  const { actualizarStock } = useInventario();
  const { id, nombre, stock, ambulanciaId, ambulanciaPatente } = useLocalSearchParams<{
    id: string;
    nombre: string;
    stock: string;
    ambulanciaId: string;
    ambulanciaPatente: string;
  }>();

  const [delta, setDelta] = useState('');
  const [loading, setLoading] = useState(false);

  const stockActual = Number(stock);

  const confirmar = async () => {
    const deltaNum = Number(delta);
    if (isNaN(deltaNum) || delta.trim() === '') {
      Alert.alert('Error', 'Ingresa un valor numérico válido.');
      return;
    }
    if (stockActual + deltaNum < 0) {
      Alert.alert('Error', `No hay suficiente stock. Stock actual: ${stockActual}`);
      return;
    }
    setLoading(true);
    try {
      await actualizarStock(Number(id), Number(ambulanciaId), deltaNum);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el stock. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Actualizar Stock" />
      <ScrollView contentContainerStyle={style.container} keyboardShouldPersistTaps="handled">
        <View style={style.infoCard}>
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Insumo</Text>
            <Text style={style.infoValor}>{nombre}</Text>
          </View>
          <View style={style.divisor} />
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Ambulancia</Text>
            <Text style={style.infoValor}>{ambulanciaPatente}</Text>
          </View>
          <View style={style.divisor} />
          <View style={style.infoRow}>
            <Text style={style.infoLabel}>Stock actual</Text>
            <Text style={[style.infoValor, style.stockBadge]}>{stockActual} unidades</Text>
          </View>
        </View>

        <Text style={style.label}>Delta de stock</Text>
        <Text style={style.hint}>Positivo para sumar, negativo para restar</Text>
        <TextInput
          style={style.input}
          value={delta}
          onChangeText={setDelta}
          keyboardType="numeric"
          placeholder="Ej: 5 o -3"
          placeholderTextColor="#aaa"
        />

        {delta.trim() !== '' && !isNaN(Number(delta)) && (
          <View style={style.previewRow}>
            <Text style={style.previewLabel}>Stock resultante</Text>
            <Text
              style={[style.previewValor, stockActual + Number(delta) < 0 && style.previewError]}
            >
              {stockActual + Number(delta)} unidades
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[style.btnConfirmar, loading && style.btnDisabled]}
          onPress={confirmar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={style.btnConfirmarText}>Confirmar</Text>
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
    marginBottom: 8,
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
  label: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
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
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  previewLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  previewValor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  previewError: {
    color: '#dc2626',
  },
  btnConfirmar: {
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnConfirmarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ActualizarStock;
