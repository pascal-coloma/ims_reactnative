import { useEffect } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FormCompleta } from '@/data/types';
import { usePacientes } from '@/context/PacienteContext';
import {
  formatearRut,
  validarRut,
  formatearFecha,
  formatearTelefono,
  validarFecha,
} from '@/utils/format';

type FormPacienteProps = {
  control: Control<FormCompleta>;
  errors: FieldErrors<FormCompleta>;
  setValue: UseFormSetValue<FormCompleta>;
};

const FormPaciente = ({ control, errors, setValue }: FormPacienteProps) => {
  const { buscarPaciente } = usePacientes();
  const rut = useWatch({ control, name: 'rut' });

  useEffect(() => {
    if (!rut || !validarRut(rut)) return;

    const rutLimpio = rut.replace(/\./g, '');
    const paciente = buscarPaciente(rutLimpio);
    if (!paciente) return;

    const partes = paciente.nombre_completo.trim().split(/\s+/);
    const [primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno] =
      partes.length >= 4
        ? [partes[0], partes[1], partes[2], partes.slice(3).join(' ')]
        : [partes[0] ?? '', '', partes[1] ?? '', partes.slice(2).join(' ')];

    setValue('primerNombre', primerNombre);
    setValue('segundoNombre', segundoNombre);
    setValue('apellidoPaterno', apellidoPaterno);
    setValue('apellidoMaterno', apellidoMaterno);
    setValue('fechaNacimiento', paciente.fecha_nacimiento.split('-').reverse().join('-'));
    setValue('telefono', formatearTelefono(paciente.telefono));
    setValue('condicionPaciente', paciente.condicion_paciente);
    setValue('direccionOrigen', paciente.direccion);
    setValue('comuna', paciente.comuna);
  }, [rut, buscarPaciente, setValue]);

  return (
    <>
      <View style={style.formulario}>
        <Text style={style.title}>Datos del Paciente</Text>
        <View>
          <Controller
            control={control}
            name="rut"
            rules={{
              required: true,
              validate: (value) => validarRut(value) || 'RUT inválido',
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              const rutCompleto = value?.replace(/[^0-9kK]/g, '').length >= 8;
              const rutValido = !rutCompleto || validarRut(value);
              return (
                <>
                  <Text style={style.label}>RUT</Text>
                  <TextInput
                    placeholder="12.345.678-9"
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(formatearRut(text))}
                    value={value}
                    style={[
                      style.input,
                      rutCompleto && !rutValido && { borderColor: '#E53935' },
                      rutCompleto && rutValido && { borderColor: '#22c55e' },
                    ]}
                    keyboardType="default"
                  />
                  {rutCompleto && !rutValido && (
                    <Text style={style.campoRequerido}>RUT inválido</Text>
                  )}
                  {errors.rut && !rutCompleto && (
                    <Text style={style.campoRequerido}>
                      {errors.rut.message || 'Campo requerido'}
                    </Text>
                  )}
                </>
              );
            }}
          />
          {errors.rut && (
            <Text style={style.campoRequerido}>{errors.rut.message || 'Campo requerido'}</Text>
          )}
        </View>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
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
              name="fechaNacimiento"
              rules={{
                required: true,
                validate: (value) => validarFecha(value) || 'Fecha inválida',
              }}
              render={({ field: { onChange, value } }) => {
                const fechaCompleta = value?.replace(/[^0-9]/g, '').length >= 8;
                const fechaValida = !fechaCompleta || validarFecha(value);

                return (
                  <>
                    <Text style={style.label}>Fecha de nacimiento</Text>
                    <TextInput
                      placeholder="DD-MM-AAAA"
                      onChangeText={(text) => onChange(formatearFecha(text))}
                      value={value}
                      style={[
                        style.input,
                        fechaCompleta && !fechaValida && { borderColor: '#E53935' },
                        fechaCompleta && fechaValida && { borderColor: '#22c55e' },
                      ]}
                      keyboardType="numeric"
                    />
                    {fechaCompleta && !fechaValida && (
                      <Text style={style.campoRequerido}>Fecha inválida</Text>
                    )}
                    {errors.fechaNacimiento && !fechaCompleta && (
                      <Text style={style.campoRequerido}>
                        {errors.fechaNacimiento.message || 'Campo requerido'}
                      </Text>
                    )}
                  </>
                );
              }}
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
});

export default FormPaciente;
