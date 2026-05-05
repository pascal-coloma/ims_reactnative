import ControlVitales from '@/components/user/ControlVitales';
import Cronologia from '@/components/user/Cronologia';
import FormPaciente from '@/components/user/FormPaciente';
import PreInformeForm from '@/components/user/PreInforme';
import { useAtenciones } from '@/context/AtencionContext';
import DEFAULT_VALUES from '@/data/constants/defaultValues';
import { FormUsuario } from '@/data/types/types';
import styles from '@/styles/globalStyles';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarAtencion = () => {
  const { agregarAtencion } = useAtenciones();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormUsuario>({
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = (data: FormUsuario) => {
    agregarAtencion({
      id: Date.now().toString(),
      despachoId: 'demo',
      fechaRegistro: new Date().toISOString(),
      paciente: {
        primerNombre: data.primerNombre,
        segundoNombre: data.segundoNombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        rut: data.rut,
        edad: data.edad,
        telefono: data.telefono,
        direccionOrigen: data.direccionOrigen,
        direccionDestino: data.direccionDestino,
      },
      controlSignos: data.controlSignos,
      preInforme: data.preInforme,
      cronologia: data.cronologia,
    });
    reset();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <FormPaciente control={control} errors={errors} />
        <ControlVitales control={control} errors={errors} />
        <PreInformeForm control={control} errors={errors} />
        <Cronologia control={control} errors={errors} />
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
