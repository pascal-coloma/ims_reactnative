import FormDespacho from '@/components/admin/FormDespacho';
import FormPaciente from '@/components/admin/FormPaciente';
import AppHeader from '@/components/AppHeader';
import { useDespachos } from '@/context/DespachosContext';
import { DEFAULT_VALUES_ADMIN } from '@/data/constants/defaultValues';
import { FormCompleta } from '@/data/types/types';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrarDespacho = () => {
  const { agregarDespacho, loading } = useDespachos();
  const [exito, setExito] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCompleta>({
    defaultValues: DEFAULT_VALUES_ADMIN,
  });

  useEffect(() => {
    if (!exito) return;
    const timer = setTimeout(() => {
      setExito(false);
      router.back();
    }, 2000);
    return () => clearTimeout(timer);
  }, [exito]);

  const onSubmit = async (data: FormCompleta) => {
    try {
      await agregarDespacho(data);
      reset();
      setExito(true);
    } catch (e: any) {
      console.error('Falló el envío del despacho', e.message);
    }
  };

  return (
    <>
      <AppHeader title="Registrar Despacho" />
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

      <Modal visible={exito} transparent animationType="fade">
        <View style={style.modalBackdrop}>
          <View style={style.modalCard}>
            <MaterialIcons name="check-circle" size={64} color="#22c55e" style={style.modalIcono} />
            <Text style={style.modalTitulo}>¡Despacho registrado!</Text>
            <Text style={style.modalSubtitulo}>
              El despacho fue creado y asignado exitosamente.
            </Text>
          </View>
        </View>
      </Modal>
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
  modalIcono: {
    marginBottom: 16,
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

export default RegistrarDespacho;
