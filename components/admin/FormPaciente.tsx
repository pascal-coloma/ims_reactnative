import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormCompleta } from '@/data/types/types';
import AppHeader from '../AppHeader';

type FormPacienteProps = {
  control: Control<FormCompleta>;
  errors: FieldErrors<FormCompleta>;
};

const FormPaciente = ({ control, errors }: FormPacienteProps) => {
  const formatearRut = (rut: string): string => {
    const clean = rut.replace(/[^0-9kK]/g, '').slice(0, 9); 
    if (clean.length <= 1) return clean;
    const cuerpo = clean.slice(0, -1);
    const dv = clean.slice(-1);
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  const formatearFecha = (fechaNacimiento: string): string => {
    const limpiar = fechaNacimiento.replace(/[^0-9]/g, '');
    if (limpiar.length <= 1) return limpiar;
    const dia = limpiar.slice(0, 2);
    const mes = limpiar.slice(2, 4);
    const anno = limpiar.slice(4, 8);
    return limpiar.length < 3
      ? dia
      : limpiar.length < 5
        ? dia + '-' + mes
        : dia + '-' + mes + '-' + anno;
  };

  const formatearTelefono = (telefono: string): string => {
    const limpio = telefono
      .replace('+569', '')
      .replace(/[^0-9]/g, '')
      .slice(0, 8);
    return '+569 ' + limpio;
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
      <AppHeader title="Registrar Despacho" />
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
                validate: (value) => {
                  if (!value) return 'Campo requerido';
                  return true;
                },
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
          <View style={{ flex: 2 }}>
            <Controller
              control={control}
              name="fechaNacimiento"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Text style={style.label}>Fecha de nacimiento</Text>
                  <TextInput
                    placeholder="DD-MM-AAAA"
                    onChangeText={(text) => onChange(formatearFecha(text))}
                    value={value}
                    style={style.input}
                    keyboardType="numeric"
                  />
                </>
              )}
            />
            {errors.fechaNacimiento && (
              <Text style={style.campoRequerido}>
                {errors.fechaNacimiento.message || 'Campo requerido'}
              </Text>
            )}
          </View>
        </View>
        <Controller
          control={control}
          rules={{ required: false }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={style.label}>Número de teléfono</Text>
              <TextInput
                placeholder="+569"
                onBlur={onBlur}
                onChangeText={(text) => onChange(formatearTelefono(text))}
                value={value}
                style={style.input}
                keyboardType="numeric"
              />
            </>
          )}
          name="telefono"
        />
        <Text style={style.label}>Condición del paciente</Text>
        <Controller
          control={control}
          name="condicionPaciente"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Describe la condición del paciente"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[style.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
            />
          )}
        />
        {errors.condicionPaciente && <Text style={style.campoRequerido}>Campo requerido</Text>}
      </View>
    </>
  );
};

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
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
