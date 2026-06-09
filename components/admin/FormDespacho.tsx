import { useAmbulancias } from '@/context/AmbulanciaContext';
import { fetchConSesion } from '@/context/AuthContext';
import { FormCompleta, Grupo } from '@/data/types';
import styles from '@/styles/globalStyles';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type FormDespachoProps = {
  control: Control<FormCompleta>;
  errors: FieldErrors<FormCompleta>;
};

const FormDespacho = ({ control, errors }: FormDespachoProps) => {
  const { ambulancias } = useAmbulancias();
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const resp = await fetchConSesion('/ims/api/grupo/');
        if (!resp.ok) return;
        const data = await resp.json();
        setGrupos(data);
      } catch (e) {
        console.error('Error fetching grupos:', e);
      }
    };
    fetchGrupos();
  }, []);

  return (
    <View style={style.formulario}>
      <Text style={style.title}>Datos del despacho</Text>
      <Controller
        control={control}
        name="direccionOrigen"
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text style={style.label}>Dirección de origen</Text>
            <TextInput
              placeholder="Ingrese dirección de origen"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          </>
        )}
      />
      {errors.direccionOrigen && <Text style={style.campoRequerido}>Campo requerido</Text>}

      <Controller
        control={control}
        name="direccionDestino"
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text style={style.label}>Dirección de destino</Text>
            <TextInput
              placeholder="Ingrese dirección de destino"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          </>
        )}
      />
      {errors.direccionDestino && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="descripcionLlamado"
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <Text style={style.label}>Descripción del llamado</Text>
            <TextInput
              placeholder="Describe el motivo del llamado"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[styles.input, style.textArea]}
              multiline
              numberOfLines={3}
            />
          </>
        )}
      />
      {errors.descripcionLlamado && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="unidad"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.label}>Ambulancia</Text>
            <View style={style.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Seleccione ambulancia" value="" enabled={false} />
                {ambulancias
                  .filter((a) => a.estado === 'disponible')
                  .map((a) => (
                    <Picker.Item key={a.id} label={a.patente} value={a.id} />
                  ))}
              </Picker>
            </View>
          </>
        )}
      />
      {errors.unidad && <Text style={style.campoRequerido}>Campo requerido</Text>}
      <Controller
        control={control}
        name="grupoAsignado"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <>
            <Text style={style.title}>Asignar Equipo</Text>
            <View style={style.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Seleccione grupo" value="" enabled={false} />
                {grupos.map((g) => (
                  <Picker.Item
                    key={g.grupo_id}
                    label={`${g.grupo_nombre}`}
                    value={String(g.grupo_id)}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}
      />
      {errors.grupoAsignado && <Text style={style.campoRequerido}>Campo requerido</Text>}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default FormDespacho;
