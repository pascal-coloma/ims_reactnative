import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { usePersonal } from '@/context/PersonalContext';
import { traducirRol } from '@/utils/labels';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EstadoBadge from '@/components/EstadoBadge';

const DetalleDespachoScreen = () => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { despachos } = useDespachos();
  const { personal } = usePersonal();
  const { ambulancias } = useAmbulancias();
  const despacho = despachos.find((d) => d.id === id);
  const ambulancia = ambulancias.find((a) => a.ambulancia_id === despacho?.ambulancia?.ambulancia_id);
  const equipoDespacho = personal.filter((p) => despacho?.personalIds?.includes(String(p.id)));

  if (!despacho) {
    return (
      <View style={styles.container}>
        <Text>Despacho no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      <View style={styles.container}>
        <View style={[style.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Despacho {despacho.id}</Text>
          <EstadoBadge estado={despacho.estado} />
        </View>
      </View>
      <View style={style.seccion}>
        <Text style={style.seccionTitulo}>Ubicación</Text>
        <View style={style.campo}>
          <Text style={style.campoLabel}>QTH1 — Origen</Text>
          <Text style={style.campoValor}>{despacho.direccionOrigen}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>QTH2 — Destino</Text>
          <Text style={style.campoValor}>{despacho.direccionDestino}</Text>
        </View>
      </View>
      <View style={style.seccion}>
        <Text style={style.seccionTitulo}>Detalles del Despacho</Text>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Descripción</Text>
          <Text style={style.campoValor}>{despacho.descripcionLlamado}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Ambulancia</Text>
          <Text style={style.campoValor}>
            {ambulancia ? ambulancia.patente : 'Sin unidad asignada'}
          </Text>
        </View>
      </View>
      <View style={style.seccion}>
        <Text style={style.seccionTitulo}>Equipo Asignado</Text>
        {equipoDespacho.length === 0 ? (
          <Text style={{ color: '#888', fontStyle: 'italic' }}>Sin personal asignado</Text>
        ) : (
          equipoDespacho.map((p) => (
            <View key={p.id} style={style.personalItem}>
              <View>
                <Text style={style.personalNombre}>
                  {p.first_name} {p.last_name}
                </Text>
                <Text style={style.personalRol}>{traducirRol(p.rol_nombre)}</Text>
              </View>
              <View
                style={[
                  style.disponibilidadPill,
                  { backgroundColor: p.is_active ? '#dcfce7' : '#fee2e2' },
                ]}
              >
                <Text style={{ color: p.is_active ? '#16a34a' : '#dc2626', fontSize: 12 }}>
                  {p.is_active ? 'Disponible' : 'Ocupado'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
  },
  seccion: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  campoLabel: {
    color: '#888',
    fontSize: 14,
  },
  campoValor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
  },
  personalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  personalNombre: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  personalRol: {
    color: '#888',
    fontSize: 12,
  },
  disponibilidadPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
});

export default DetalleDespachoScreen;
