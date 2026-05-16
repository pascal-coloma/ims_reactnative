import ControlVitales from '@/components/user/ControlVitales';
import Cronologia from '@/components/user/Cronologia';
import FormPaciente from '@/components/user/FormPaciente';
import PreInformeForm from '@/components/user/PreInforme';
import { useAtenciones } from '@/context/AtencionContext';
import { useDespachos } from '@/context/DespachosContext';
import { DEFAULT_VALUES_USUARIO } from '@/data/constants/defaultValues';
import { FormUsuario } from '@/data/types/types';
import styles from '@/styles/globalStyles';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarAtencion = () => {
  const { agregarAtencion } = useAtenciones();
  const { despachoActivo } = useDespachos();
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


  const { handleSubmit, reset, formState: { errors }, control } = methods;

  const onSubmit = async (data: FormUsuario) => {
    if (!despachoActivo) {
      Alert.alert('Error', 'No tienes un despacho activo asignado');
      return;
    }
    try {
      const { controlSignos, preInforme, cronologia, ...camposPaciente } = data;
      await agregarAtencion(
        {
          id: Date.now().toString(),
          despachoId: despachoActivo.id,
          fechaRegistro: new Date().toISOString(),
          paciente: camposPaciente,
          controlSignos,
          preInforme,
          cronologia,
        },
        despachoActivo.ambulancia?.id ?? '',
        despachoActivo.direccionOrigen, // ← direccion_despacho
      );
      reset();
    } catch (e: any) {
      console.error('Error en onSubmit:', e?.message);
    }
  };
  return (
    <>
      <FormProvider {...methods}>
        <View style={{ flex: 1 }} key={despachoActivo?.id ?? 'sin-despacho'}>
          <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
            <FormPaciente control={methods.control} errors={errors} />
            <ControlVitales control={methods.control} errors={errors} />
            <PreInformeForm control={methods.control} errors={errors} />
            <Cronologia control={methods.control} errors={errors} />
          </ScrollView>
          <View style={local.botonesContainer}>
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
    </>
  );
};

const local = StyleSheet.create({
  botonesContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  botonEnviar: {
    flex: 2,
  },
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
});

export default RegistrarAtencion;
