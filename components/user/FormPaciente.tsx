import { useDespachos } from '@/context/DespachosContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormUsuario } from '@/data/types/types';

type FormPacienteProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

const CampoReadonly = ({ label, value }: { label: string; value: string | number }) => (
  <View style={style.campoWrapper}>
    <Text style={style.label}>{label}</Text>
    <View style={style.inputReadonly}>
      <Text style={style.inputReadonlyTexto}>{value || '—'}</Text>
    </View>
  </View>
);

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
  const esPrecargado = !!despachoActivo;

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
          <Text style={styles.title}>Registrar Atención</Text>
        </View>
      </View>

      <View style={style.formulario}>
        <Text style={style.sectionTitle}>Datos del Paciente</Text>

        {esPrecargado && (
          <View style={style.banner}>
            <MaterialIcons name="info-outline" size={15} color="#1565C0" />
            <Text style={style.bannerTexto}>Datos cargados desde el despacho activo</Text>
          </View>
        )}

        {esPrecargado ? (
          <>
            <CampoReadonly label="Primer Nombre" value={despachoActivo.primerNombre} />
            <CampoReadonly
              label="Segundo Nombre (opcional)"
              value={despachoActivo.segundoNombre ?? '—'}
            />
            <CampoReadonly label="Apellido Paterno" value={despachoActivo.apellidoPaterno} />
            <CampoReadonly label="Apellido Materno" value={despachoActivo.apellidoMaterno} />
            <View style={style.fila}>
              <View style={{ flex: 2 }}>
                <CampoReadonly label="RUT" value={despachoActivo.rut} />
              </View>
              <View style={style.separador} />
              <View style={{ flex: 1 }}>
                <CampoReadonly label="Edad" value={`${despachoActivo.edad} años`} />
              </View>
            </View>
            <CampoReadonly label="Teléfono" value={despachoActivo.telefono} />
            <CampoReadonly label="Dirección de Origen" value={despachoActivo.direccionOrigen} />
            <CampoReadonly label="Dirección de Destino" value={despachoActivo.direccionDestino} />

            <View style={{ display: 'none' }}>
              <Controller control={control} name="primerNombre" render={() => <></>} />
              <Controller control={control} name="segundoNombre" render={() => <></>} />
              <Controller control={control} name="apellidoPaterno" render={() => <></>} />
              <Controller control={control} name="apellidoMaterno" render={() => <></>} />
              <Controller control={control} name="rut" render={() => <></>} />
              <Controller control={control} name="edad" render={() => <></>} />
              <Controller control={control} name="telefono" render={() => <></>} />
              <Controller control={control} name="direccionOrigen" render={() => <></>} />
              <Controller control={control} name="direccionDestino" render={() => <></>} />
            </View>
          </>
        ) : (
          <>
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
                    value={value}
                    style={style.input}
                  />
                )}
              />
            </CampoEditable>

            <CampoEditable label="Segundo Nombre (opcional)">
              <Controller
                control={control}
                name="segundoNombre"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Ingrese segundo nombre"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={style.input}
                  />
                )}
              />
            </CampoEditable>

            <CampoEditable
              label="Apellido Paterno"
              error={errors.apellidoPaterno && 'Campo requerido'}
            >
              <Controller
                control={control}
                name="apellidoPaterno"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Ingrese primer apellido"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={style.input}
                  />
                )}
              />
            </CampoEditable>

            <CampoEditable
              label="Apellido Materno"
              error={errors.apellidoMaterno && 'Campo requerido'}
            >
              <Controller
                control={control}
                name="apellidoMaterno"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Ingrese segundo apellido"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={style.input}
                  />
                )}
              />
            </CampoEditable>

            <View style={style.fila}>
              <View style={{ flex: 2 }}>
                <CampoEditable
                  label="RUT"
                  error={errors.rut?.message || (errors.rut && 'Campo requerido')}
                >
                  <Controller
                    control={control}
                    name="rut"
                    rules={{ required: true, validate: (v) => validarRut(v) || 'RUT inválido' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="12.345.678-9"
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(formatearRut(text))}
                        value={value}
                        style={style.input}
                        keyboardType="default"
                      />
                    )}
                  />
                </CampoEditable>
              </View>
              <View style={style.separador} />
              <View style={{ flex: 1 }}>
                <CampoEditable
                  label="Edad"
                  error={errors.edad?.message || (errors.edad && 'Campo requerido')}
                >
                  <Controller
                    control={control}
                    name="edad"
                    rules={{
                      required: true,
                      min: { value: 0, message: 'Inválida' },
                      max: { value: 120, message: 'Inválida' },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="50"
                        onBlur={onBlur}
                        onChangeText={(v) => onChange(Number(v))}
                        value={value?.toString()}
                        style={style.input}
                        keyboardType="numeric"
                      />
                    )}
                  />
                </CampoEditable>
              </View>
            </View>

            <CampoEditable label="Teléfono" error={errors.telefono && 'Campo requerido'}>
              <Controller
                control={control}
                name="telefono"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Teléfono de contacto"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={style.input}
                    keyboardType="numeric"
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
                    value={value}
                    style={style.input}
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
                    value={value}
                    style={style.input}
                  />
                )}
              />
            </CampoEditable>
          </>
        )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
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
  campoWrapper: {
    marginBottom: 16,
  },
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
  inputReadonly: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F7F7',
  },
  inputReadonlyTexto: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  campoRequerido: {
    color: '#E53935',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 3,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  separador: {
    width: 12,
  },
});

export default FormPaciente;
