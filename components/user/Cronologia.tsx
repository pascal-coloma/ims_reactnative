import { CATEGORIAS_EMERGENCIA } from '@/data/constants/mockAmbulancia';
import { FormUsuario } from '@/data/types/types';
import styles from '@/styles/globalStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type CronologiaProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
};

const TimePickerField = ({ label, value, onChange }: TimePickerFieldProps) => {
  const [show, setShow] = useState(false);
  const parsed = value ? new Date(`1970-01-01T${value}`) : new Date();

  return (
    <View style={local.timeField}>
      <Text style={local.label}>{label}</Text>
      <TouchableOpacity style={local.timeInput} onPress={() => setShow(true)}>
        <Text style={value ? local.timeText : local.timePlaceholder}>{value || '--:--'}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          mode="time"
          value={parsed}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
          onValueChange={(_, date) => {
            setShow(false);
            if (!date) return;
            const hh = date.getHours().toString().padStart(2, '0');
            const mm = date.getMinutes().toString().padStart(2, '0');
            onChange(`${hh}:${mm}`);
          }}
        />
      )}
    </View>
  );
};

const FILAS: { left: { label: string; name: any }; right: { label: string; name: any } }[] = [
  {
    left: { label: 'Hora de llamada', name: 'cronologia.horaLlamada' },
    right: { label: 'Despacho móvil', name: 'cronologia.despachoMovil' },
  },
  {
    left: { label: 'Llegada QTH1', name: 'cronologia.llegadaQTH1' },
    right: { label: 'Salida QTH1', name: 'cronologia.salidaQTH1' },
  },
  {
    left: { label: 'Llegada QTH2', name: 'cronologia.llegadaQTH2' },
    right: { label: 'Salida QTH2', name: 'cronologia.salidaQTH2' },
  },
];

const Cronologia = ({ control, errors }: CronologiaProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cronología</Text>

      {FILAS.map((fila, i) => (
        <View key={i} style={local.fila}>
          <Controller
            control={control}
            name={fila.left.name}
            render={({ field: { onChange, value } }) => (
              <TimePickerField label={fila.left.label} value={value} onChange={onChange} />
            )}
          />
          <View style={local.separador} />
          <Controller
            control={control}
            name={fila.right.name}
            render={({ field: { onChange, value } }) => (
              <TimePickerField label={fila.right.label} value={value} onChange={onChange} />
            )}
          />
        </View>
      ))}

      <Text style={local.label}>Categorización</Text>
      <Controller
        control={control}
        name="cronologia.categoria"
        render={({ field: { onChange, value } }) => {
          const seleccionada = CATEGORIAS_EMERGENCIA.find((c) => c.value === value);

          return (
            <>
              <TouchableOpacity style={local.pickerWrapper} onPress={() => setOpen(true)}>
                <Text style={seleccionada ? local.timeText : local.timePlaceholder}>
                  {seleccionada?.label ?? 'Seleccione categoría...'}
                </Text>
              </TouchableOpacity>

              <Modal visible={open} transparent animationType="fade">
                <Pressable style={local.modalBackdrop} onPress={() => setOpen(false)}>
                  <View style={local.modalCard}>
                    <Text style={local.modalTitulo}>Categorización</Text>
                    <FlatList
                      data={CATEGORIAS_EMERGENCIA}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[local.modalItem, value === item.value && local.modalItemActivo]}
                          onPress={() => {
                            onChange(item.value);
                            setOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              local.categoriaTexto,
                              value === item.value && local.categoriaTextoActivo,
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
      {errors.cronologia?.categoria && (
        <Text style={local.error}>{errors.cronologia.categoria.message}</Text>
      )}
    </View>
  );
};

const local = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  separador: {
    width: 12,
  },
  timeField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  timePlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  modalItemActivo: {
    backgroundColor: '#E53935',
  },
  categoriaTexto: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoriaTextoActivo: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: '#E53935',
    fontSize: 12,
    marginBottom: 8,
  },
});

export default Cronologia;
