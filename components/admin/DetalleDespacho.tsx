import { Despacho } from '@/data/mock/mockDespachos';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EstadoBadge from '../EstadoBadge';

const DetalleDespacho = ({ despacho }: { despacho: Despacho }) => {
  const { ambulancias } = useAmbulancias();
  const ambulancia = ambulancias.find(
    (a) => a.ambulancia_id === despacho.ambulancia?.ambulancia_id,
  );

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

        <View style={local.rutaRow}>
          <MaterialIcons name="warning" size={14} color="#888" />
          <Text style={local.dato} numberOfLines={1}>
            {despacho.descripcionLlamado}
          </Text>
        </View>

        {ambulancia && (
          <View style={local.rutaRow}>
            <MaterialIcons name="airport-shuttle" size={14} color="#888" />
            <Text style={local.dato} numberOfLines={1}>
              {ambulancia.patente}
            </Text>
          </View>
        )}

        {despacho.grupoNombre && (
          <View style={local.rutaRow}>
            <MaterialIcons name="group" size={14} color="#888" />
            <Text style={local.dato}>{despacho.grupoNombre}</Text>
          </View>
        )}

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
    fontSize: 15,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
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
});

export default DetalleDespacho;
