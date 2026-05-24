import FormDespacho from '@/components/admin/FormDespacho';
import FormPaciente from '@/components/admin/FormPaciente';
import { useDespachos } from '@/context/DespachosContext';
import { DEFAULT_VALUES_ADMIN } from '@/data/constants/defaultValues';
import { FormCompleta } from '@/data/types';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarDespacho = () => {
  const { agregarDespacho, loading } = useDespachos();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCompleta>({
    defaultValues: DEFAULT_VALUES_ADMIN,
  });

  const onSubmit = async (data: FormCompleta) => {
    console.log('data submit:', JSON.stringify(data, null, 2));

    try {
      await agregarDespacho(data);
      reset();
      router.back();
    } catch (e: any) {
      console.error('Falló el envío del despacho', e.message);
    }
  };

  return (
    <>
      <ScrollView>
        <FormPaciente control={control} errors={errors} />
        <FormDespacho control={control} errors={errors} />
        <View style={style.rowBotones}>
          <TouchableOpacity style={style.btnCancelar} onPress={() => router.back()}>
            <Text style={style.btnTextDark}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[style.btnSubmit, loading && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit, (errors) =>
              console.log('Errores validación:', JSON.stringify(errors, null, 2)),
            )}
            disabled={loading}
          >
            <Text style={style.btnText}>{loading ? 'Enviando...' : 'Enviar despacho'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
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
