import { useLocalSearchParams, router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { usePersonal } from '@/context/PersonalContext';

const estadoColors: Record<string, string> = {
  activo: '#22c55e',
  pendiente: '#ef4444',
  completado: '#eab308',
};

const prioridadColors: Record<string, string> = {
  alta: '#ef4444',
  media: '#f97316',
  baja: '#22c55e',
};

const DetalleDespachoScreen = () => {
  const { id } = useLocalSearchParams();
  const { despachos } = useDespachos();
  const { personal } = usePersonal();
  const despacho = despachos.find((d) => d.id === id);

  const equipoDespacho = personal.filter((p) => despacho?.personalIds.includes(p.id));

  if (!despacho) {
    return (
      <View style={styles.container}>
        <Text>Despacho no encontrado</Text>
      </View>
    );
  }

  const nombreCompleto =
    despacho.primerNombre +
    ' ' +
    despacho.segundoNombre +
    ' ' +
    despacho.apellidoPaterno +
    ' ' +
    despacho.apellidoMaterno;

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={style.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{despacho.id}</Text>
          <View
            style={[
              style.estadoPill,
              { backgroundColor: estadoColors[despacho.estado], alignItems: 'center' },
            ]}
          >
            <Text style={style.estadoPillText}>
              {despacho.estado[0].toUpperCase() + despacho.estado.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={style.seccion}>
        <Text style={style.seccionTitulo}>Datos del Paciente</Text>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Nombre</Text>
          <Text style={style.campoValor}>{nombreCompleto}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>RUT</Text>
          <Text style={style.campoValor}>{despacho.rut}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Edad</Text>
          <Text style={style.campoValor}>{despacho.edad} años</Text>
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
          <Text style={style.campoLabel}>Tipo de Emergencia</Text>
          <Text style={style.campoValor}>{despacho.tipoEmergencia}</Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Prioridad</Text>
          <Text style={[style.campoValor, { color: prioridadColors[despacho.prioridad] }]}>
            {despacho.prioridad[0].toUpperCase() + despacho.prioridad.slice(1)}
          </Text>
        </View>
        <View style={style.campo}>
          <Text style={style.campoLabel}>Unidad</Text>
          <Text style={style.campoValor}>{despacho.unidad}</Text>
        </View>
        {despacho.observaciones && (
          <View style={style.campo}>
            <Text style={style.campoLabel}>Observaciones</Text>
            <Text style={style.campoValor}>{despacho.observaciones}</Text>
          </View>
        )}
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
                <Text style={style.personalRol}>{p.rol__nombre_rol}</Text>
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
      <Stack.Screen options={{ headerShown: false }} />
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
  estadoPill: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  estadoPillText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
