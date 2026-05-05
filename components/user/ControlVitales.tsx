import { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, useFieldArray, useWatch } from 'react-hook-form';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormUsuario } from '@/data/types/types';

const { width } = Dimensions.get('window');

type ControlVitalesProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

function PaginaControl({
  control,
  errors,
  index,
}: {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
  index: number;
}) {
  const pas = useWatch({ control, name: `controlSignos.${index}.pas` }) ?? 0;
  const pad = useWatch({ control, name: `controlSignos.${index}.pad` }) ?? 0;
  const pam = Math.round((pad * 2 + pas) / 3);

  useEffect(() => {
    control._formValues.controlSignos[index].pam = pam;
  }, [pam]);

  return (
    <View style={style.pagina}>
      <Text style={style.cardHeader}>
        Control {index + 1} —{' '}
        {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      <Text style={style.label}>PAS — Presión Arterial Sistólica</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.pas`}
        rules={{ required: true, min: { value: 0, message: 'Valor inválido' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="120"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />
      {errors.controlSignos?.[index]?.pas && (
        <Text style={style.campoRequerido}>Campo requerido</Text>
      )}

      <Text style={style.label}>PAD — Presión Arterial Diastólica</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.pad`}
        rules={{ required: true, min: { value: 0, message: 'Valor inválido' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="80"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />
      {errors.controlSignos?.[index]?.pad && (
        <Text style={style.campoRequerido}>Campo requerido</Text>
      )}

      <Text style={style.label}>PAM — Presión Arterial Media</Text>
      <View style={style.inputCalculado}>
        <Text style={style.inputCalculadoTexto}>{pam || '--'}</Text>
      </View>
      <Text style={style.label}>FC — Frecuencia Cardíaca</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.fc`}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="80"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={style.label}>FR — Frecuencia Respiratoria</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.fr`}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="16"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={style.label}>SAT O₂ (%)</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.satO2`}
        rules={{ required: true, max: { value: 100, message: 'Máximo 100%' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="98"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={style.label}>FIO₂ (%)</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.fio2`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="21"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={style.label}>T° — Temperatura (°C)</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.temperatura`}
        rules={{ min: { value: 30, message: 'Inválida' }, max: { value: 45, message: 'Inválida' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="36.5"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="decimal-pad"
          />
        )}
      />

      <Text style={style.label}>HGT — Hemoglucotest</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.hgt`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="100"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />

      <Text style={style.label}>GCS — Glasgow Coma Scale (3-15)</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.gcs`}
        rules={{ min: { value: 3, message: 'Mínimo 3' }, max: { value: 15, message: 'Máximo 15' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="15"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value > 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />
      {errors.controlSignos?.[index]?.gcs && (
        <Text style={style.campoRequerido}>{errors.controlSignos[index].gcs?.message}</Text>
      )}

      <Text style={style.label}>EVA — Escala de Dolor (0-10)</Text>
      <Controller
        control={control}
        name={`controlSignos.${index}.eva`}
        rules={{ min: { value: 0, message: 'Mínimo 0' }, max: { value: 10, message: 'Máximo 10' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="0"
            onBlur={onBlur}
            onChangeText={(v) => onChange(Number(v))}
            value={value >= 0 ? value.toString() : ''}
            style={style.input}
            keyboardType="numeric"
          />
        )}
      />
      {errors.controlSignos?.[index]?.eva && (
        <Text style={style.campoRequerido}>{errors.controlSignos[index].eva?.message}</Text>
      )}
    </View>
  );
}

function ControlVitales({ control, errors }: ControlVitalesProps) {
  const [paginaActual, setPaginaActual] = useState(0);
  const { fields, append } = useFieldArray({
    control,
    name: 'controlSignos',
  });

  const nuevoControl = () => {
    append({
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      pas: 0,
      pad: 0,
      pam: 0,
      fc: 0,
      fr: 0,
      satO2: 0,
      fio2: 0,
      temperatura: 0,
      hgt: 0,
      gcs: 0,
      eva: 0,
    });
    setPaginaActual(fields.length);
  };

  return (
    <View style={style.formulario}>
      <View style={style.headerRow}>
        <Text style={style.title}>Signos Vitales</Text>
        {fields.length > 0 && (
          <Text style={style.paginaIndicador}>
            T{paginaActual + 1} de {fields.length}
          </Text>
        )}
      </View>

      {fields.length === 0 ? (
        <Text style={style.sinControles}>Sin controles registrados</Text>
      ) : (
        <>
          <PaginaControl control={control} errors={errors} index={paginaActual} />

          {fields.length > 1 && (
            <View style={style.navegacion}>
              <TouchableOpacity
                style={[style.navBoton, paginaActual === 0 && style.navBotonDisabled]}
                onPress={() => setPaginaActual((p) => p - 1)}
                disabled={paginaActual === 0}
              >
                <Text style={style.navBotonTexto}>← Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  style.navBoton,
                  paginaActual === fields.length - 1 && style.navBotonDisabled,
                ]}
                onPress={() => setPaginaActual((p) => p + 1)}
                disabled={paginaActual === fields.length - 1}
              >
                <Text style={style.navBotonTexto}>Siguiente →</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={style.botonNuevoControl} onPress={nuevoControl}>
        <Text style={style.botonNuevoControlTexto}>+ Nuevo control</Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  formulario: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paginaIndicador: {
    fontSize: 13,
    color: '#888',
  },
  sinControles: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  pagina: {
    width: width - 40,
    paddingRight: 10,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputCalculado: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    backgroundColor: '#F1F8E9',
  },
  inputCalculadoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  formulaHint: {
    fontSize: 11,
    color: '#888',
    marginBottom: 16,
  },
  campoRequerido: {
    color: '#E53935',
    textAlign: 'right',
    marginBottom: 5,
  },
  botonNuevoControl: {
    borderWidth: 1.5,
    borderColor: '#1976D2',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonNuevoControlTexto: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 15,
  },
  navegacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBoton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  navBotonDisabled: {
    borderColor: '#ccc',
  },
  navBotonTexto: {
    color: '#1976D2',
    fontWeight: '600',
  },
});

export default ControlVitales;
