import AppHeader from '@/components/AppHeader';
import { useGrupos } from '@/context/GrupoContext';
import { usePersonal } from '@/context/PersonalContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CrearGrupo = () => {
  const insets = useSafeAreaInsets();
  const { crearGrupo } = useGrupos();
  const { personal } = usePersonal();
  const [nombre, setNombre] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activos = personal.filter((p) => p.is_active);

  const togglePersonal = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCrear = async () => {
    if (!nombre.trim()) {
      setError('El nombre del grupo es requerido');
      return;
    }
    if (seleccionados.size === 0) {
      setError('Selecciona al menos un miembro');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await crearGrupo(nombre.trim(), Array.from(seleccionados));
      router.back();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Crear Grupo" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
        <Text style={local.label}>Nombre del grupo</Text>
        <TextInput
          style={[styles.input, { marginBottom: 20 }]}
          placeholder="Nombre del grupo"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={local.label}>Seleccionar miembros</Text>
        {activos.map((p) => {
          const id = parseInt(p.id, 10);
          const marcado = seleccionados.has(id);
          return (
            <TouchableOpacity key={p.id} style={local.item} onPress={() => togglePersonal(id)}>
              <View style={[local.checkbox, marcado && local.checkboxMarcado]}>
                {marcado && <MaterialIcons name="check" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={local.itemNombre}>
                  {p.first_name} {p.last_name}
                </Text>
                <Text style={local.itemRut}>{p.rut}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {error && <Text style={local.error}>{error}</Text>}
      </ScrollView>

      <View style={[local.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.button} onPress={handleCrear} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  itemRut: {
    fontSize: 12,
    color: '#888',
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
});

export default CrearGrupo;
