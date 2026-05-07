import { usePersonal } from '@/context/PersonalContext';
import { Despacho } from '@/data/constants/mockDespachos';
import styles from '@/styles/globalStyles';
import { traducirRol } from '@/utils/labels';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ESTADO_COLOR: Record<Despacho['estado'], string> = {
  activo: '#22c55e',
  pendiente: '#FB8C00',
  completado: '#1976D2',
};

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: '#E53935',
  media: '#FB8C00',
  baja: '#43A047',
};

const DetalleDespacho = ({ despacho }: { despacho: Despacho }) => {
  const { personal } = usePersonal();
  const equipoDespacho = personal.filter((p) =>
    despacho.personalIds.includes(p.id)
  );

  const nombreCompleto = [
    despacho.primerNombre,
    despacho.segundoNombre,
    despacho.apellidoPaterno,
    despacho.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/detalledespacho/${despacho.id}`)}
      >
        <View style={styles.container}>
          <View style={local.headerRow}>
            <Text style={local.idTexto}>{despacho.id}</Text>
            <View style={local.badgeRow}>
              <View style={[local.badge, { backgroundColor: PRIORIDAD_COLOR[despacho.prioridad] }]}>
                <Text style={local.badgeTexto}>{despacho.prioridad.toUpperCase()}</Text>
              </View>
              <View style={[local.badge, { backgroundColor: ESTADO_COLOR[despacho.estado] }]}>
                <Text style={local.badgeTexto}>
                  {despacho.estado[0].toUpperCase() + despacho.estado.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={local.pacienteNombre}>{nombreCompleto}</Text>
          <Text style={local.dato}>RUT: {despacho.rut}</Text>

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

          <Text style={local.dato}>Emergencia: {despacho.tipoEmergencia}</Text>

          {despacho.ambulancia && (
            <Text style={local.dato}>
              Unidad: {despacho.ambulancia.modelo} — {despacho.ambulancia.patente}
            </Text>
          )}

          {equipoDespacho.map((p) => (
            <View key={p.id} style={local.equipoItem}>
              <Text style={local.dato}>
                {p.first_name} {p.last_name}
              </Text>
              <Text style={local.equipoRol}>{traducirRol(p.rol__nombre_rol)}</Text>
            </View>
          ))}


          <View style={local.divisor} />
        </View>
      </TouchableOpacity>

    </>
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
  pacienteNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
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
  accionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  btnAsignar: {
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAsignarTexto: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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