import { usePersonal } from '@/context/PersonalContext';
import { Despacho } from '@/data/constants/mockDespachos';
import styles from '@/styles/globalStyles';
import { traducirRol } from '@/utils/labels';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EstadoBadge from '../EstadoBadge';

const DetalleDespacho = ({ despacho }: { despacho: Despacho }) => {
  const { personal } = usePersonal();
  const { ambulancias } = useAmbulancias();
  const equipoDespacho = personal.filter((p) => despacho.personalIds.includes(String(p.id)));
  const ambulancia = ambulancias.find((a) => a.id === despacho.ambulancia?.id);

  return (
    <TouchableOpacity onPress={() => router.push(`/(admin)/detalledespacho/${despacho.id}`)}>
      <View style={styles.container}>
        <View style={local.headerRow}>
          <Text style={local.idTexto}>Despacho {despacho.id}</Text>
          <EstadoBadge estado={despacho.estado} />
        </View>

        <View style={local.rutaRow}>
          <MaterialIcons name="place" size={14} color="#888" />
          <Text style={local.dato} numberOfLines={1}>
            {despacho.direccionOrigen}
          </Text>
        </View>
        <View style={local.rutaRow}>
          <MaterialIcons name="local-hospital" size={14} color="#888" />
          <Text style={local.dato} numberOfLines={1}>
            {despacho.direccionDestino}
          </Text>
        </View>

        <Text style={local.dato}>Emergencia: {despacho.descripcionLlamado}</Text>

        {ambulancia && (
          <Text style={local.dato}>
            Unidad: {ambulancia.modelo} — {ambulancia.patente}
          </Text>
        )}

        {equipoDespacho.map((p) => (
          <View key={p.id} style={local.equipoItem}>
            <Text style={local.dato}>
              {p.first_name} {p.last_name}{' '}
            </Text>
            <Text style={local.equipoRol}>{traducirRol(p.rol_nombre)}</Text>
          </View>
        ))}

        <View style={local.divisor} />
      </View>
    </TouchableOpacity>
  );
};

const local = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeTexto: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rutaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dato: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginTop: 12,
  },
  equipoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  equipoRol: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default DetalleDespacho;
