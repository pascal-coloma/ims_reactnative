import AppHeader from '@/components/AppHeader';
import { useAtenciones } from '@/context/AtencionContext';
import { generatePDF } from '@/utils/pdf';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ListaAtenciones = () => {
  const { resumenAtenciones, fetchAtenciones, fetchAtencionDetalle, loading, error } =
    useAtenciones();
  const [generando, setGenerando] = useState<number | null>(null);

  useEffect(() => {
    fetchAtenciones();
  }, []);

  const handleGenerarPDF = async (id: number) => {
    setGenerando(id);
    try {
      const datos = await fetchAtencionDetalle(id);
      if (!datos) throw new Error('Sin datos');
      await generatePDF(datos);
    } catch (e) {
      console.error('Error generando PDF:', e);
    } finally {
      setGenerando(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Atenciones" />

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

        {resumenAtenciones.map((a, index) => (
          <View key={a.id} style={[styles.container, index % 2 === 1 && local.filaAlterna]}>
            <View style={local.rowHeader}>
              <Text style={styles.title}>Atención #{a.id} </Text>
              <View
                style={[
                  local.badge,
                  {
                    backgroundColor: a.estado_sello === 'Pendiente' ? '#FEF9C3' : '#DCFCE7',
                  },
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

            <Text style={styles.title}>{a.paciente__nombre_completo ?? `Atención #${a.id}`}</Text>
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
              style={[local.btnPDF, generando === a.id && local.btnPDFDisabled]}
              onPress={() => handleGenerarPDF(a.id)}
              disabled={generando === a.id}
            >
              {generando === a.id ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : (
                <MaterialIcons name="picture-as-pdf" size={18} color="#E53935" />
              )}
              <Text style={local.btnPDFTexto}>
                {generando === a.id ? 'Generando...' : 'Generar PDF'}
              </Text>
            </TouchableOpacity>

            <View style={local.divisor} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  filaAlterna: {
    backgroundColor: '#F3F4F6',
  },
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
  btnPDF: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E53935',
    alignSelf: 'flex-start',
  },
  btnPDFDisabled: {
    borderColor: '#ccc',
  },
  btnPDFTexto: {
    color: '#E53935',
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

export default ListaAtenciones;
