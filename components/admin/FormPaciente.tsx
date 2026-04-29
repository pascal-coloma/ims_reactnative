import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormCompleta } from '../../../shared/types/types';

type FormPacienteProps = {
  control: Control<FormCompleta>;
  errors: FieldErrors<FormCompleta>;
};

const FormPaciente = ({ control, errors }: FormPacienteProps) => {
  const formatearRut = (rut: string): string => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoFormateado}-${dv}`;
  };
  const validarRut = (rut: string): boolean => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1).toLowerCase();

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : String(dvEsperado);

    return dv === dvCalculado;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={style.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Registrar Paciente</Text>
        </View>
      </View>
      <View style={style.formulario}>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.title}>Datos del Paciente</Text>
              <Text style={style.label}>Primer Nombre</Text>
              <TextInput
                placeholder="Ingrese primer nombre"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="primerNombre"
        />
        {errors.primerNombre && <Text style={style.campoRequerido}>Campo requerido</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>{`Segundo nombre (opcional)`}</Text>
              <TextInput
                placeholder="Ingrese segundo nombre"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="segundoNombre"
        />
        {errors.segundoNombre && <Text style={style.campoRequerido}>Problema al registrar</Text>}

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>Apellido Paterno</Text>
              <TextInput
                placeholder="Ingrese primer apellido"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="apellidoPaterno"
        />
        {errors.apellidoPaterno && <Text style={style.campoRequerido}>Campo requerido</Text>}

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>Apellido materno</Text>
              <TextInput
                placeholder="Ingrese segundo apellido"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="apellidoMaterno"
        />
        {errors.apellidoMaterno && <Text style={style.campoRequerido}>Campo requerido</Text>}
        <View style={[{ flexDirection: 'row', gap: 10 }]}>
          <View style={{ flex: 2 }}>
            <Controller
              control={control}
              name="rut"
              rules={{
                required: true,
                validate: (value) => validarRut(value) || 'RUT inválido',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text style={style.label}>RUT</Text>
                  <TextInput
                    placeholder="12.345.678-9"
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatearRut(text))}
                    value={value}
                    style={style.input}
                    keyboardType="default"
                  />
                </>
              )}
            />
            {errors.rut && (
              <Text style={style.campoRequerido}>{errors.rut.message || 'Campo requerido'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="edad"
              rules={{
                required: true,
                min: { value: 0, message: 'Edad inválida' },
                max: { value: 120, message: 'Edad inválida' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text style={style.label}>Edad</Text>
                  <TextInput
                    placeholder="54"
                    onBlur={onBlur}
                    onChangeText={(edad) => onChange(Number(edad))}
                    value={value?.toString()}
                    style={style.input}
                    keyboardType="numeric"
                  />
                </>
              )}
            />
            {errors.edad && (
              <Text style={style.campoRequerido}>{errors.edad.message || 'Campo requerido'}</Text>
            )}
          </View>
        </View>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>Dirección de origen</Text>
              <TextInput
                placeholder="Ingrese dirección de origen"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="direccionOrigen"
        />
        {errors.direccionOrigen && <Text style={style.campoRequerido}>Campo requerido</Text>}

        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>Dirección de destino</Text>
              <TextInput
                placeholder="Ingrese dirección de destino"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={style.input}
              />
            </>
          )}
          name="direccionDestino"
        />
        {errors.direccionDestino && <Text style={style.campoRequerido}>Campo requerido</Text>}
      </View>
    </>
  );
};

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
  formulario: {
    padding: 20,
    backgroundColor: 'white',
  },
  campoRequerido: {
    color: '#E53935',
    textAlign: 'right',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  divisor: {
    height: 5,
    backgroundColor: 'grey',
  },
});

export default FormPaciente;
