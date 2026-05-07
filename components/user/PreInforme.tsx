import { Controller, Control, FieldErrors } from 'react-hook-form';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import styles from '@/styles/globalStyles';
import { FormUsuario } from '@/data/types/types';

type PreInformeProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

const PreInformeForm = ({ control, errors }: PreInformeProps) => {
  return (
    <View style={styles.container}>
      <Text style={local.title}>Pre Informe</Text>

      <Text style={local.label}>Pre informe de rescate</Text>
      <Controller
        control={control}
        name="preInforme.preInforme"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={local.textoInput}
              multiline
              maxLength={650}
              onChangeText={onChange}
              value={value}
              placeholder="Ingrese pre informe de rescate..."
            />
            <Text style={local.contador}>{(value?.length ?? 0)}/650</Text>
          </>
        )}
      />
      {errors.preInforme?.preInforme && (
        <Text style={local.error}>{errors.preInforme.preInforme.message}</Text>
      )}

      <Text style={local.label}>Motivo de llamado</Text>
      <Controller
        control={control}
        name="preInforme.motivoLlamado"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={local.textoInput}
              multiline
              maxLength={650}
              onChangeText={onChange}
              value={value}
              placeholder="Ingrese motivo de llamado..."
            />
            <Text style={local.contador}>{(value?.length ?? 0)}/650</Text>
          </>
        )}
      />
      {errors.preInforme?.motivoLlamado && (
        <Text style={local.error}>{errors.preInforme.motivoLlamado.message}</Text>
      )}
      <Text style={local.label}>Estado del paciente</Text>
      <Controller
        control={control}
        name="preInforme.estadoPaciente"
        render={({ field: { onChange, value } }) => (
          <View style={local.estadoRow}>
            <TouchableOpacity
              style={[local.estadoBoton, value === 'estable' && local.botonEstable]}
              onPress={() => onChange('estable')}
            >
              <Text style={[local.estadoTexto, value === 'estable' && local.textoEstable]}>
                Estable
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[local.estadoBoton, value === 'inestable' && styles.button]}
              onPress={() => onChange('inestable')}
            >
              <Text style={[local.estadoTexto, value === 'inestable' && styles.buttonText]}>
                Inestable
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.preInforme?.estadoPaciente && (
        <Text style={local.error}>{errors.preInforme.estadoPaciente.message}</Text>
      )}
    </View>
  );
};

const local = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    width: '100%',
  },
  contador: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 16,
    width: '100%',
  },
  error: {
    color: '#E53935',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  estadoRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  estadoBoton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  botonEstable: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  estadoTexto: {
    fontWeight: '600',
    fontSize: 15,
    color: '#888',
  },
  textoEstable: {
    color: '#2E7D32',
  },
  textoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    width: '100%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PreInformeForm;