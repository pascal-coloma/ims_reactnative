import AppHeader from '@/components/AppHeader';
import { useAmbulancias } from '@/context/AmbulanciaContext';
import {
  AMBULANCIA_ESTADO,
  AMBULANCIA_ESTADO_LABEL,
  AmbulanciaEstado,
} from '@/data/constants/ambulanciaEstados';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from '@/components/AppTextInput';

const ESTADOS_INICIALES: { label: string; value: AmbulanciaEstado }[] = [
  {
    label: AMBULANCIA_ESTADO_LABEL[AMBULANCIA_ESTADO.DISPONIBLE],
    value: AMBULANCIA_ESTADO.DISPONIBLE,
  },
  {
    label: AMBULANCIA_ESTADO_LABEL[AMBULANCIA_ESTADO.ENPREPARACION],
    value: AMBULANCIA_ESTADO.ENPREPARACION,
  },
  {
    label: AMBULANCIA_ESTADO_LABEL[AMBULANCIA_ESTADO.MANTENCION],
    value: AMBULANCIA_ESTADO.MANTENCION,
  },
];

type FormAmbulancia = {
  patente: string;
  modelo: string;
  estado_disponibilidad: AmbulanciaEstado;
};

const RegistrarAmbulancia = () => {
  const { registrarAmbulancia } = useAmbulancias();
  const [estadoModalVisible, setEstadoModalVisible] = useState(false);
  const [resultado, setResultado] = useState<{ ambulancia_id: number } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormAmbulancia>({
    defaultValues: {
      patente: '',
      modelo: '',
      estado_disponibilidad: AMBULANCIA_ESTADO.DISPONIBLE,
    },
  });

  const onSubmit = async (data: FormAmbulancia) => {
    setCargando(true);
    setError(null);
    try {
      const result = await registrarAmbulancia(data);
      setResultado(result);
      reset();
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  if (resultado) {
    return (
      <View style={style.container}>
        <AppHeader title="Ambulancia Registrada" onBack={() => setResultado(null)} />
        <View style={style.resultadoCard}>
          <MaterialIcons
            name="check-circle"
            size={60}
            color="#22c55e"
            style={{ alignSelf: 'center', marginBottom: 16 }}
          />
          <Text style={style.resultadoTitulo}>¡Ambulancia registrada!</Text>
          <Text style={style.resultadoLabel}>ID de ambulancia</Text>
          <View style={style.resultadoValor}>
            <Text style={style.resultadoCodigo}>#{resultado.ambulancia_id}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setResultado(null);
              router.back();
            }}
          >
            <Text style={styles.buttonText}>Volver al panel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <AppHeader title="Registrar Ambulancia" />
      <ScrollView>
        <View style={style.formulario}>
          {error && (
            <View style={style.errorBanner}>
              <Text style={style.errorTexto}>{error}</Text>
            </View>
          )}

          <Text style={style.label}>Patente</Text>
          <Controller
            control={control}
            name="patente"
            rules={{ required: true, maxLength: 10 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Ej: ABCD12"
                onBlur={onBlur}
                onChangeText={(t) => onChange(t.toUpperCase())}
                value={value}
                autoCapitalize="characters"
                maxLength={10}
                style={style.input}
              />
            )}
          />
          {errors.patente && (
            <Text style={style.campoRequerido}>Campo requerido (máx. 10 caracteres)</Text>
          )}

          <Text style={style.label}>Modelo</Text>
          <Controller
            control={control}
            name="modelo"
            rules={{ required: true, maxLength: 100 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Ej: Mercedes Sprinter 2023"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                maxLength={100}
                style={style.input}
              />
            )}
          />
          {errors.modelo && <Text style={style.campoRequerido}>Campo requerido</Text>}

          <Text style={style.label}>Estado inicial</Text>
          <Controller
            control={control}
            name="estado_disponibilidad"
            render={({ field: { onChange, value } }) => {
              const seleccionado = ESTADOS_INICIALES.find((e) => e.value === value);
              return (
                <>
                  <TouchableOpacity
                    style={style.picker}
                    onPress={() => setEstadoModalVisible(true)}
                  >
                    <Text style={style.pickerTexto}>
                      {seleccionado?.label ?? 'Seleccione estado'}
                    </Text>
                    <MaterialIcons name="expand-more" size={20} color="#666" />
                  </TouchableOpacity>

                  <Modal visible={estadoModalVisible} transparent animationType="fade">
                    <Pressable
                      style={style.modalBackdrop}
                      onPress={() => setEstadoModalVisible(false)}
                    >
                      <View style={style.modalCard}>
                        <Text style={style.modalTitulo}>Estado inicial</Text>
                        <FlatList
                          data={ESTADOS_INICIALES}
                          keyExtractor={(item) => item.value}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={[
                                style.modalItem,
                                value === item.value && style.modalItemActivo,
                              ]}
                              onPress={() => {
                                onChange(item.value);
                                setEstadoModalVisible(false);
                              }}
                            >
                              <Text
                                style={[
                                  style.modalTexto,
                                  value === item.value && { color: 'white', fontWeight: 'bold' },
                                ]}
                              >
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </Pressable>
                  </Modal>
                </>
              );
            }}
          />

          <TouchableOpacity
            style={[styles.button, { marginTop: 8 }, cargando && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={cargando}
          >
            <Text style={styles.buttonText}>{cargando ? 'Registrando...' : 'Registrar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  formulario: { padding: 20, backgroundColor: 'white' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  campoRequerido: { color: '#E53935', textAlign: 'right', marginBottom: 8 },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
  },
  errorTexto: { color: '#E53935', fontSize: 13 },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerTexto: { fontSize: 16, color: '#111' },
  modalBackdrop: { flex: 1, backgroundColor: '#00000055', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  modalTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  modalItem: { padding: 14, borderRadius: 8, marginBottom: 6 },
  modalItemActivo: { backgroundColor: '#E53935' },
  modalTexto: { fontSize: 14, color: '#333', fontWeight: '500' },
  resultadoCard: { margin: 16, padding: 20, backgroundColor: 'white', borderRadius: 12 },
  resultadoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111',
  },
  resultadoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  resultadoValor: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultadoCodigo: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});

export default RegistrarAmbulancia;
