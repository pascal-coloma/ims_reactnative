import FormDespacho from '@/components/admin/FormDespacho';
import FormPaciente from '@/components/admin/FormPaciente';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useDespachos } from '@/context/DespachosContext';
import { usePersonal } from '@/context/PersonalContext';
import { DEFAULT_VALUES_ADMIN } from '@/data/constants/defaultValues';
import { generatePDF } from '@/data/constants/generatePDF';
import { mockAmbulancias } from '@/data/constants/mockAmbulancia';
import { Despacho } from '@/data/constants/mockDespachos';
import { FormCompleta } from '@/data/types/types';
import { traducirRol } from '@/utils/labels';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarPaciente = () => {
  const { agregarDespacho, despachos } = useDespachos();
  const { actualizarDisponilidad, personal } = usePersonal();
  const { ambulancias } = useAmbulancias();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCompleta>({
    defaultValues: DEFAULT_VALUES_ADMIN,
  });

  const construirDespacho = (data: FormCompleta): Despacho => ({
    primerNombre: data.primerNombre,
    segundoNombre: data.segundoNombre,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    rut: data.rut,
    edad: data.edad,
    telefono: data.telefono,
    direccionOrigen: data.direccionOrigen,
    direccionDestino: data.direccionDestino,
    id: `DSP-${despachos.length + 1}`,
    estado: 'activo',
    prioridad: data.prioridad as Despacho['prioridad'],
    tipoEmergencia: data.tipoEmergencia,
    unidad: data.unidad,
    personalIds: data.equipoAsignado,
    ambulancia: ambulancias.find((a) => a.id === data.unidad),
    observaciones: data.observaciones,
  });

  const onSubmit = (data: FormCompleta) => {
    const nuevoDespacho = construirDespacho(data);
    data.equipoAsignado.forEach((id) => actualizarDisponilidad(id));
    agregarDespacho(nuevoDespacho);
    reset();
    router.back();
  };

  const onGenerarPDF = (data: FormCompleta) => {
    const equipoConNombres = personal
      .filter((p) => data.equipoAsignado.includes(p.id))
      .map((p) => `${p.first_name} ${p.last_name} — ${traducirRol(p.rol__nombre_rol)}`);

    const ambulancia = ambulancias.find((a) => a.id === data.unidad);
    const unidadLabel = ambulancia ? `${ambulancia.patente} — ${ambulancia.modelo}` : data.unidad;

    generatePDF({ ...data, equipoAsignado: equipoConNombres, unidad: unidadLabel });
  };

  return (
    <ScrollView>
      <FormPaciente control={control} errors={errors} />
      <FormDespacho control={control} errors={errors} />
      <View style={style.rowBotones}>
        <TouchableOpacity style={style.btnCancelar} onPress={handleSubmit(onGenerarPDF)}>
          <Text style={style.btnTextDark}>Generar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.btnCancelar} onPress={() => router.back()}>
          <Text style={style.btnTextDark}>Cancelar</Text>
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
    gap: 12,
    padding: 20,
  },
  btnSubmit: {
    flex: 2,
    backgroundColor: '#E53935',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#f1bebe',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnTextDark: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RegistrarPaciente;
