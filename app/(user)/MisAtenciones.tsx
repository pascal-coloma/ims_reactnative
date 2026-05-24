import AppHeader from '@/components/AppHeader';
import { useAtenciones } from '@/context/AtencionContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const MisAtenciones = () => {
  const { resumenAtenciones, fetchAtenciones, loading, error } = useAtenciones();

  useEffect(() => {
    fetchAtenciones();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Mis Atenciones" />

      <ScrollView>
        {loading && (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#E53935" />
          </View>
        )}

        {error && (
          <View style={styles.container}>
            <Text style={{ color: '#E53935' }}>{error}</Text>
          </View>
        )}

        {!loading && resumenAtenciones.length === 0 && (
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin atenciones registradas</Text>
          </View>
        )}

        {resumenAtenciones.map((a) => (
          <View key={a.id} style={styles.container}>
            <View style={local.rowHeader}>
              <Text style={styles.title}>Atención #{a.id}</Text>
              <View
                style={[
                  local.badge,
                  { backgroundColor: a.estado_sello === 'Pendiente' ? '#FEF9C3' : '#DCFCE7' },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: a.estado_sello === 'Pendiente' ? '#854D0E' : '#15803D',
                  }}
                >
                  {a.estado_sello}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{a.paciente__nombre_completo}</Text>
            <Text style={styles.subtitle}>
              {new Date(a.hora_salida).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            <TouchableOpacity
              style={local.btnEditar}
              onPress={() =>
                router.push({ pathname: '/(user)/ModificarAtencion', params: { id: String(a.id) } })
              }
            >
              <MaterialIcons name="edit" size={18} color="#1976D2" />
              <Text style={local.btnEditarTexto}>Editar</Text>
            </TouchableOpacity>

            <View style={local.divisor} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  btnEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    alignSelf: 'flex-start',
  },
  btnEditarTexto: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 13,
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginTop: 10,
  },
});

export default MisAtenciones;
