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
import { formatearRut, validarRut } from '@/utils/format';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import AppHeader from '@/components/AppHeader';

const RegistrarAtencion = () => {
  const { agregarAtencion } = useAtenciones();
  const { despachoActivo } = useDespachos();
  const { recargar: recargarInventario, loading: loadingInventario } = useInventario();
  const [exito, setExito] = useState(false);
  const [firmado, setFirmado] = useState(false);
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

  const onSubmit = useCallback(
    async (data: FormUsuario) => {
      if (!despachoActivo) {
        Alert.alert('Error', 'No tienes un despacho activo asignado');
        return;
      }
      try {
        const {
          controlSignos,
          preInforme,
          cronologia,
          insumosUtilizados,
          rutReceptor,
          ...camposPaciente
        } = data;
        const result = await agregarAtencion(
          {
            id: crypto.randomUUID(),
            despachoId: despachoActivo.id,
            fechaRegistro: new Date().toISOString(),
            paciente: camposPaciente,
            controlSignos,
            preInforme,
            cronologia,
            insumosUtilizados,
            rutReceptor,
          },
          despachoActivo.ambulancia?.id ?? '',
        );
        setFirmado(result?.estado_sello === 'Firmado');
        reset();
        setExito(true);
      } catch (e: any) {
        console.error('Error en onSubmit:', e?.message);
        Alert.alert('Error', 'No se pudo registrar la atención. Intenta nuevamente.');
      }
    },
    [despachoActivo, agregarAtencion, reset],
  );

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

            <View style={local.rutReceptorContainer}>
              <Text style={styles.title}>Receptor</Text>
              <Controller
                control={methods.control}
                name="rutReceptor"
                rules={{
                  required: 'Campo requerido',
                  validate: (v) => validarRut(v) || 'RUT inválido',
                }}
                render={({ field: { onChange, onBlur, value } }) => {
                  const completo = (value ?? '').replace(/[^0-9kK]/g, '').length >= 8;
                  const valido = !completo || validarRut(value ?? '');
                  return (
                    <>
                      <Text style={local.rutLabel}>RUT de quien recibe al paciente</Text>
                      <TextInput
                        placeholder="12.345.678-9"
                        onBlur={onBlur}
                        onChangeText={(t) => onChange(formatearRut(t))}
                        value={value}
                        style={[
                          local.rutInput,
                          completo && !valido && { borderColor: '#E53935' },
                          completo && valido && { borderColor: '#22c55e' },
                        ]}
                        keyboardType="default"
                        autoCapitalize="none"
                      />
                      {completo && !valido && <Text style={local.rutError}>RUT inválido</Text>}
                      {errors.rutReceptor && !completo && (
                        <Text style={local.rutError}>
                          {errors.rutReceptor.message || 'Campo requerido'}
                        </Text>
                      )}
                    </>
                  );
                }}
              />
            </View>
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
              {firmado
                ? 'La atención fue registrada y firmada exitosamente.'
                : 'La atención fue registrada. La firma del documento está pendiente.'}
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
  rutReceptorContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 8,
  },
  rutLabel: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    color: '#333',
  },
  rutInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  rutError: {
    color: '#E53935',
    textAlign: 'right',
    marginBottom: 5,
    fontSize: 13,
  },
});

export default RegistrarAtencion;
