import { Control, Controller, FieldErrors } from 'react-hook-form';
import { FormCompleta } from '../../../shared/types/types';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Touchable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CATEGORIAS_EMERGENCIA, mockAmbulancias } from '@/constants/mockAmbulancia';
import styles from '@/styles/globalStyles';
import { usePersonal } from '@/context/PersonalContext';

type FormDespachoProps = {
  control: Control<FormCompleta>;
  errors: FieldErrors<FormCompleta>;
};

const FormDespacho = ({ control, errors }: FormDespachoProps) => {
  const { personal } = usePersonal();
  return (
    <View style={style.formulario}>
      <Controller
        control={control}
        name="prioridad"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.title}>Detalles del Despacho</Text>
            <Text style={style.label}>Prioridad</Text>
            <View style={style.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Seleccione prioridad" value="" enabled={false} />
                <Picker.Item label="Alta" value="alta" />
                <Picker.Item label="Media" value="media" />
                <Picker.Item label="Baja" value="baja" />
              </Picker>
            </View>
          </>
        )}
      />
      {errors.prioridad && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="tipoEmergencia"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.label}>Categoría de emergencia</Text>
            <View style={style.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Seleccione categoría" value="" enabled={false} />
                {CATEGORIAS_EMERGENCIA.map((cat) => (
                  <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </Picker>
            </View>
          </>
        )}
      />
      {errors.tipoEmergencia && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="unidad"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.label}>Unidad</Text>
            <View style={style.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Seleccione unidad" value="" enabled={false} />
                {mockAmbulancias
                  .filter((a) => a.disponible)
                  .map((a) => (
                    <Picker.Item
                      key={a.id}
                      label={`${a.numeroMovil} - ${a.patente} (${a.tipo})`}
                      value={a.id}
                    />
                  ))}
              </Picker>
            </View>
          </>
        )}
      />
      {errors.unidad && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="observaciones"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text style={style.label}>Observaciones (opcional)</Text>
            <TextInput
              placeholder="Ingrese observaciones"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[styles.input, style.textArea]}
              multiline
              numberOfLines={4}
            />
          </>
        )}
      />
      <Controller
        control={control}
        name="equipoAsignado"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.title}>Asignar Equipo</Text>
            {personal
              .filter((p) => p.is_active)
              .filter((p) => p.rol__nombre_rol != 'control')
              .map((p) => {
                const seleccionado = value?.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[style.checkItem, seleccionado && style.checkItemSeleccionado]}
                    onPress={() => {
                      const actual = value ?? [];
                      onChange(
                        seleccionado
                          ? actual.filter((id: string) => id !== p.id)
                          : [...actual, p.id],
                      );
                    }}
                  >
                    <Text style={seleccionado && { color: 'white' }}>
                      {p.first_name} {p.last_name} — {p.rol__nombre_rol}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </>
        )}
      />
      {errors.equipoAsignado && <Text style={style.campoRequerido}>Campo requerido</Text>}
    </View>
  );
};

const style = StyleSheet.create({
  formulario: {
    padding: 20,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  campoRequerido: {
    color: '#E53935',
    textAlign: 'right',
    marginBottom: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkItemSeleccionado: {
    backgroundColor: '#e60303',
    borderColor: '#e60303',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default FormDespacho;
