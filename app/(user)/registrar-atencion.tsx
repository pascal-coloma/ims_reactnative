import ControlVitales from '@/components/user/ControlVitales';
import Cronologia from '@/components/user/Cronologia';
import FormPaciente from '@/components/user/FormPaciente';
import InsumosForm from '@/components/user/InsumosForm';
import PreInformeForm from '@/components/user/PreInforme';
import { useAtenciones } from '@/context/AtencionContext';
import { useDespachos } from '@/context/DespachosContext';
import { useInventario } from '@/context/InventoryContext';
import { DEFAULT_VALUES_USUARIO } from '@/data/constants/defaultValues';
import { FormUsuario } from '@/data/types';
import styles from '@/styles/globalStyles';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import AppHeader from '@/components/AppHeader';

const RegistrarAtencion = () => {
  const { agregarAtencion } = useAtenciones();
  const { despachoActivo } = useDespachos();
  const { recargar: recargarInventario, loading: loadingInventario } = useInventario();
  const [exito, setExito] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refrescarSwipe = () => {
    setRefreshing(true);
    recargarInventario();
    setRefreshing(false);
  };

  const methods = useForm<FormUsuario>({
    defaultValues: despachoActivo
      ? {
          ...DEFAULT_VALUES_USUARIO,
          direccionOrigen: despachoActivo.direccionOrigen,
          direccionDestino: despachoActivo.direccionDestino,
          rut: despachoActivo.paciente?.rut ?? '',
        }
      : DEFAULT_VALUES_USUARIO,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: FormUsuario) => {
    if (!despachoActivo) {
      Alert.alert('Error', 'No tienes un despacho activo asignado');
      return;
    }
    try {
      const { controlSignos, preInforme, cronologia, insumosUtilizados, ...camposPaciente } = data;
      await agregarAtencion(
        {
          id: Date.now().toString(),
          despachoId: despachoActivo.id,
          fechaRegistro: new Date().toISOString(),
          paciente: camposPaciente,
          controlSignos,
          preInforme,
          cronologia,
          insumosUtilizados,
        },
        despachoActivo.ambulancia?.id ?? '',
      );
      reset();
      setExito(true);
    } catch (e: any) {
      console.error('Error en onSubmit:', e?.message);
      Alert.alert('Error', 'No se pudo registrar la atención. Intenta nuevamente.');
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <View style={{ flex: 1 }} key={despachoActivo?.id ?? 'sin-despacho'}>
          <AppHeader title="Registrar Atención" />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 90 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || loadingInventario}
                onRefresh={refrescarSwipe}
              />
            }
          >
            <FormPaciente control={methods.control} errors={errors} />
            <ControlVitales control={methods.control} errors={errors} />
            <InsumosForm control={methods.control} errors={errors} />
            <PreInformeForm control={methods.control} errors={errors} />
            <Cronologia control={methods.control} errors={errors} />
          </ScrollView>

          <View style={[local.botonesContainer]}>
            <TouchableOpacity style={local.botonLimpiar} onPress={() => reset()}>
              <Text style={local.botonLimpiarTexto}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, local.botonEnviar]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Registrar atención</Text>
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
            <Text style={local.modalTitulo}>¡Atención registrada!</Text>
            <Text style={local.modalSubtitulo}>
              La atención fue registrada y firmada exitosamente.
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
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  botonEnviar: { flex: 2 },
  botonLimpiar: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E53935',
    alignItems: 'center',
  },
  botonLimpiarTexto: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
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

export default RegistrarAtencion;
