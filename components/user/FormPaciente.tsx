import { MaterialIcons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors, useFormContext } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FormUsuario } from '@/data/types';
import { useDespachos } from '@/context/DespachosContext';
import { useEffect, useState } from 'react';
import { fetchConSesion } from '@/context/AuthContext';
import { formatearRut } from '@/utils/format';

type FormPacienteProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

const CampoEditable = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <View style={style.campoWrapper}>
    <Text style={style.label}>{label}</Text>
    {children}
    {error && <Text style={style.campoRequerido}>{error}</Text>}
  </View>
);

const FormPaciente = ({ control, errors }: FormPacienteProps) => {
  const { despachoActivo } = useDespachos();
  const paciente = despachoActivo?.paciente ?? null;
  const { setValue } = useFormContext<FormUsuario>();
  const [pacienteDetalle, setPacienteDetalle] = useState<any>(null);

  useEffect(() => {
    const buscar = async () => {
      if (!paciente?.rut) return;
      try {
        const resp = await fetchConSesion(
          `/ims/api/pacientes/get/?rut=${encodeURIComponent(paciente.rut)}`,
        );
        if (resp.ok) {
          const data = await resp.json();
          setPacienteDetalle(data);
          // ← sincroniza con el form
          setValue('rut', data.rut);
          setValue('primerNombre', data.nombre_completo?.split(' ')[0] ?? '');
          setValue('apellidoPaterno', data.nombre_completo?.split(' ')[1] ?? '');
          setValue('fechaNacimiento', data.fecha_nacimiento ?? '');
          setValue('telefono', data.telefono ?? '');
          setValue('condicionPaciente', data.condicion_paciente ?? '');
          setValue('direccionOrigen', despachoActivo?.direccionOrigen ?? '');
          setValue('direccionDestino', despachoActivo?.direccionDestino ?? '');
        }
      } catch (e) {
        console.error('Error buscando paciente:', e);
      }
    };
    buscar();
  }, [paciente?.rut]);

  return (
    <View style={style.formulario}>
      <Text style={style.sectionTitle}>Datos del Paciente</Text>
      {paciente && (
        <View style={style.banner}>
          <MaterialIcons name="info-outline" size={15} color="#1565C0" />
          <Text style={style.bannerTexto}>Datos cargados desde el despacho activo</Text>
        </View>
      )}

      <CampoEditable label="Primer Nombre" error={errors.primerNombre && 'Campo requerido'}>
        <Controller
          control={control}
          name="primerNombre"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Ingrese primer nombre"
              onBlur={onBlur}
              onChangeText={onChange}
              value={paciente?.nombre_completo?.split(' ')[0] ?? value}
              style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
              editable={!paciente}
            />
          )}
        />
      </CampoEditable>

      <CampoEditable label="Apellido Paterno" error={errors.apellidoPaterno && 'Campo requerido'}>
        <Controller
          control={control}
          name="apellidoPaterno"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Ingrese apellido paterno"
              onBlur={onBlur}
              onChangeText={onChange}
              value={paciente?.nombre_completo?.split(' ')[1] ?? value}
              style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
              editable={!paciente}
            />
          )}
        />
      </CampoEditable>

      <View style={style.fila}>
        <View style={{ flex: 1 }}>
          <CampoEditable
            label="RUT"
            error={errors.rut?.message || (errors.rut && 'Campo requerido')}
          >
            <Controller
              control={control}
              name="rut"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="12.345.678-9"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatearRut(text))}
                  value={paciente?.rut ?? value}
                  style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
                  editable={!paciente}
                  keyboardType="default"
                />
              )}
            />
          </CampoEditable>
        </View>
        <View style={style.separador} />
        <View style={{ flex: 2 }}>
          <CampoEditable label="Fecha de nacimiento">
            <Controller
              control={control}
              name="fechaNacimiento"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="AAAA-MM-DD"
                  onChangeText={onChange}
                  value={pacienteDetalle?.fecha_nacimiento ?? value}
                  style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
                  editable={!paciente}
                  keyboardType="numeric"
                />
              )}
            />
          </CampoEditable>
        </View>
      </View>

      <CampoEditable label="Teléfono">
        <Controller
          control={control}
          name="telefono"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Teléfono de contacto"
              onBlur={onBlur}
              onChangeText={onChange}
              value={pacienteDetalle?.telefono ?? value}
              style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
              editable={!paciente}
              keyboardType="numeric"
            />
          )}
        />
      </CampoEditable>

      <CampoEditable label="Condición del paciente">
        <Controller
          control={control}
          name="condicionPaciente"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Describe la condición del paciente"
              onBlur={onBlur}
              onChangeText={onChange}
              value={pacienteDetalle?.condicion_paciente ?? value}
              style={[
                style.input,
                { height: 80, textAlignVertical: 'top' },
                paciente && { backgroundColor: '#F7F7F7' },
              ]}
              editable={!paciente}
              multiline
            />
          )}
        />
      </CampoEditable>

      <CampoEditable
        label="Dirección de Origen"
        error={errors.direccionOrigen && 'Campo requerido'}
      >
        <Controller
          control={control}
          name="direccionOrigen"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Ingrese dirección de origen"
              onBlur={onBlur}
              onChangeText={onChange}
              value={pacienteDetalle?.direccion ?? value}
              style={[style.input, paciente && { backgroundColor: '#F7F7F7' }]}
              editable={!paciente}
            />
          )}
        />
      </CampoEditable>

      <CampoEditable
        label="Dirección de Destino"
        error={errors.direccionDestino && 'Campo requerido'}
      >
        <Controller
          control={control}
          name="direccionDestino"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Ingrese dirección de destino"
              onBlur={onBlur}
              onChangeText={onChange}
              value={despachoActivo?.direccionDestino ?? value}
              style={[style.input, { backgroundColor: '#F7F7F7' }]}
              editable={false}
            />
          )}
        />
      </CampoEditable>
    </View>
  );
};

const style = StyleSheet.create({
  formulario: { padding: 20, backgroundColor: 'white' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  campoWrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
  },
  campoRequerido: { color: '#E53935', fontSize: 12, textAlign: 'right', marginTop: 3 },
  fila: { flexDirection: 'row', alignItems: 'flex-start' },
  separador: { width: 12 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  bannerTexto: {
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '500',
  },
});

export default FormPaciente;
