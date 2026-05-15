import FormDespacho from '@/components/admin/FormDespacho';
import FormPaciente from '@/components/admin/FormPaciente';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import { useDespachos } from '@/context/DespachosContext';
import { usePersonal } from '@/context/PersonalContext';
import { DEFAULT_VALUES_ADMIN } from '@/data/constants/defaultValues';
import { generatePDF } from '@/data/constants/generatePDF';
import { Despacho } from '@/data/constants/mockDespachos';
import { FormCompleta } from '@/data/types/types';
import { traducirRol } from '@/utils/labels';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarDespacho = () => {
  const { agregarDespacho, despachos, loading } = useDespachos();
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

  const onSubmit = async (data: FormCompleta) => {
    console.log('direccionOrigen:', data.direccionOrigen);
    console.log('direccionDestino:', data.direccionDestino);
    console.log('equipoAsignado:', data.equipoAsignado);
    console.log('unidad:', data.unidad);
    try {
      await agregarDespacho(data); // ahora maneja los 3 pasos
      data.equipoAsignado.forEach((id) => actualizarDisponilidad(id));
      reset();
      router.back();
    } catch (e) {
      // el error ya está en el estado del contexto
      console.error('Falló el envío del despacho');
    }
  };

  const onGenerarPDF = (data: FormCompleta) => {
    const equipoConNombres = personal
      .filter((p) => data.equipoAsignado.includes(p.id))
      .map((p) => `${p.first_name} ${p.last_name} — ${traducirRol(p.rol_nombre)}`);

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
        <TouchableOpacity
          style={[style.btnSubmit, loading && { opacity: 0.6 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={style.btnText}>
            {loading ? 'Enviando...' : 'Enviar despacho'}
          </Text>
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

export default RegistrarDespacho;
