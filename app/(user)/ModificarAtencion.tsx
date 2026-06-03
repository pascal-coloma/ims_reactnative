import ControlVitales from '@/components/user/ControlVitales';
import Cronologia from '@/components/user/Cronologia';
import PreInformeForm from '@/components/user/PreInforme';
import AppHeader from '@/components/AppHeader';
import { useAtenciones } from '@/context/AtencionContext';
import { FormUsuario } from '@/data/types';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ModificarAtencion = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchAtencionDetalleLocal, modificarAtencion } = useAtenciones();
  const [cargando, setCargando] = useState(true);
  const [exito, setExito] = useState(false);

  const methods = useForm<FormUsuario>({
    defaultValues: {
      controlSignos: [],
      preInforme: { preInforme: '', motivoLlamado: '', estadoPaciente: '' },
      cronologia: {
        horaLlamada: '',
        despachoMovil: '',
        llegadaQTH1: '',
        salidaQTH1: '',
        llegadaQTH2: '',
        salidaQTH2: '',
        categoria: '',
      },
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!id) return;
    fetchAtencionDetalleLocal(Number(id)).then((data) => {
      if (!data) return;
      reset({
        controlSignos: (data.signos_vitales ?? []).map((sv: any) => ({
          hora: sv.hora ?? '',
          pas: sv.presion_sistolica ?? 0,
          pad: sv.presion_diastolica ?? 0,
          pam: 0,
          fc: sv.frecuencia_cardiaca ?? 0,
          fr: sv.fr ?? 0,
          satO2: sv.saturacion_oxigeno ?? 0,
          fio2: sv.fio2 ?? 0,
          temperatura: sv.temperatura ?? 0,
          hgt: sv.hgt ?? 0,
          gcs: sv.gcs ?? 0,
          eva: sv.eva ?? 0,
        })),
        preInforme: {
          preInforme: data.preinforme?.pre_informe ?? '',
          motivoLlamado: data.preinforme?.motivo_llamado ?? '',
          estadoPaciente: data.preinforme?.estado_paciente ?? '',
        },
        cronologia: {
          horaLlamada: data.cronologia?.hora_llamada ?? '',
          despachoMovil: data.cronologia?.despacho_movil ?? '',
          llegadaQTH1: data.cronologia?.llegada_qth1 ?? '',
          salidaQTH1: data.cronologia?.salida_qth1 ?? '',
          llegadaQTH2: data.cronologia?.llegada_qth2 ?? '',
          salidaQTH2: data.cronologia?.salida_qth2 ?? '',
          categoria: data.cronologia?.categoria ?? '',
        },
      });
      setCargando(false);
    });
  }, [id]);

  const onSubmit = async (data: FormUsuario) => {
    try {
      await modificarAtencion(Number(id), {
        controlSignos: data.controlSignos,
        preInforme: data.preInforme,
        cronologia: data.cronologia,
      });
      setExito(true);
    } catch {
      Alert.alert('Error', 'No se pudo modificar la atención. Intenta nuevamente.');
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader title="Modificar Atención" />
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      </View>
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <View style={{ flex: 1 }}>
          <AppHeader title={`Modificar Atención #${id}`} />

          <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
            <ControlVitales control={methods.control} errors={errors} />
            <PreInformeForm control={methods.control} errors={errors} />
            <Cronologia control={methods.control} errors={errors} />
          </ScrollView>

          <View style={local.botonesContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FormProvider>

      <Modal visible={exito} transparent animationType="fade">
        <View style={local.modalBackdrop}>
          <View style={local.modalCard}>
            <MaterialIcons
              name="check-circle"
              size={64}
              color="#22c55e"
              style={{ marginBottom: 16 }}
            />
            <Text style={local.modalTitulo}>¡Atención modificada!</Text>
            <Text style={local.modalSubtitulo}>
              Los cambios fueron guardados y firmados exitosamente.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 24, width: '100%' }]}
              onPress={() => {
                setExito(false);
                router.back();
              }}
            >
              <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const local = StyleSheet.create({
  botonesContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ModificarAtencion;
