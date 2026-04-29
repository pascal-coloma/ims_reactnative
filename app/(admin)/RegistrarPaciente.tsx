import FormDespacho from '@/components/admin/FormDespacho';
import FormPaciente from '@/components/admin/FormPaciente';
import { FormCompleta } from '../../../shared/types/types';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Despacho } from '@/constants/mockDespachos';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDespachos } from '@/context/DespachosContext';
import DEFAULT_VALUES from '@/constants/defaultValues';
import { Paciente } from '@/constants/mockPaciente';
import { usePacientes } from '@/context/PacienteContext';
import { usePersonal } from '@/context/PersonalContext';
import { generatePDF } from '@/constants/generatePDF';

const RegistrarPaciente = () => {
  const { agregarDespacho, despachos } = useDespachos();
  const { agregarPaciente, pacientes } = usePacientes();
  const { actualizarDisponilidad, personal } = usePersonal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCompleta>({
    defaultValues: DEFAULT_VALUES,
  });

  const storeData = async (data: FormCompleta) => {
    try {
      const content = JSON.stringify(data);
      await AsyncStorage.setItem('key', content);
    } catch (e) {
      console.error(e);
    }
  };

  const checkStorage = async () => {
    const raw = await AsyncStorage.getItem('key');
    console.log('stored:', raw ? JSON.parse(raw) : null);
  };

  const handlerPdf = async (data: FormCompleta) => {
    generatePDF(data);
  };

  const onSubmit = (data: FormCompleta) => {
    const nuevoDespacho: Despacho = {
      id: String(despachos.length + 1),
      rutPaciente: data.rut,
      nombrePaciente:
        `${data.primerNombre} ${data.segundoNombre ?? ''} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim(),
      edad: data.edad,
      destino: data.direccionDestino,
      origen: data.direccionOrigen,
      estado: 'pendiente',
      prioridad: data.prioridad as Despacho['prioridad'],
      tipoEmergencia: data.tipoEmergencia,
      unidad: data.unidad,
      personal: personal.filter((p) => data.equipoAsignado.includes(p.id)),
      observaciones: data.observaciones,
    };
    data.equipoAsignado.forEach((id) => actualizarDisponilidad(id));
    agregarDespacho(nuevoDespacho);

    const nuevoPaciente: Paciente = {
      rut: data.rut,
      pnombre: data.primerNombre,
      snombre: data.segundoNombre,
      apaterno: data.apellidoPaterno,
      amaterno: data.apellidoMaterno,
      edad: data.edad,
      telefono: data.telefono,
    };
    agregarPaciente(nuevoPaciente);
    storeData(data);
    generatePDF(data);
    checkStorage();
    reset();

    router.back();
  };
  return (
    <ScrollView>
      <FormPaciente control={control} errors={errors} />
      <FormDespacho control={control} errors={errors} />
      <View style={style.rowBotones}>
        <TouchableOpacity style={style.btnCancelar} onPress={() => handlerPdf}>
          <Text>Generar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.btnCancelar} onPress={() => router.back()}>
          <Text style={style.btnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.btnSubmit} onPress={handleSubmit(onSubmit)}>
          <Text style={style.btnText}>Enviar despacho</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  rowBotones: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    padding: 20,
  },
  btnSubmit: {
    backgroundColor: '#e60303',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelar: {
    backgroundColor: '#f1bebe',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RegistrarPaciente;
