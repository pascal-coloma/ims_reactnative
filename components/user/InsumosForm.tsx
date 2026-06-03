import { Controller, Control, FieldErrors, useFieldArray } from 'react-hook-form';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { FormUsuario } from '@/data/types';
import { useInventario } from '@/context/InventoryContext';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '@/styles/globalStyles';

type InsumosProps = {
  control: Control<FormUsuario>;
  errors: FieldErrors<FormUsuario>;
};

const InsumosForm = ({ control, errors }: InsumosProps) => {
  const [busqueda, setBusqueda] = useState('');
  const { insumos, recargar, loading } = useInventario();
  const { fields, append, remove } = useFieldArray({ control, name: 'insumosUtilizados' });

  const insumosFiltrados = busqueda.trim()
    ? insumos.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  const agregarInsumo = (insumo: (typeof insumos)[0]) => {
    if (fields.some((f) => f.insumoId === insumo.id)) return;
    append({
      insumoId: insumo.id,
      dosis: 1,
      observaciones: '',
    });
    setBusqueda('');
  };

  return (
    <View style={styles.container}>
      <View style={local.headerRow}>
        <Text style={local.title}>Insumos Utilizados</Text>
        <TouchableOpacity onPress={recargar} disabled={loading}>
          <MaterialIcons name="refresh" size={22} color={loading ? '#ccc' : '#E53935'} />
        </TouchableOpacity>
      </View>

      <Text style={local.label}>Buscar insumo</Text>
      <TextInput
        style={local.input}
        placeholder="Escriba el nombre del insumo..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {busqueda.trim().length > 0 && (
        <View style={local.resultados}>
          {insumosFiltrados.length === 0 ? (
            <Text style={local.sinResultados}>Sin resultados para `&quot;`{busqueda}`&ldquo`</Text>
          ) : (
            insumosFiltrados.map((insumo) => (
              <TouchableOpacity
                key={insumo.id}
                style={local.resultadoItem}
                onPress={() => agregarInsumo(insumo)}
              >
                <View style={local.resultadoTextos}>
                  <Text style={local.resultadoNombre}>{insumo.nombre}</Text>
                  <Text style={local.resultadoDetalle}>
                    {insumo.cantidad} {insumo.unidadMedida}
                    {insumo.categoria ? ` · ${insumo.categoria}` : ''}
                  </Text>
                </View>
                <MaterialIcons name="add-circle-outline" size={24} color="#E53935" />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {errors.insumosUtilizados?.root && (
        <Text style={local.errorText}>{errors.insumosUtilizados.root.message}</Text>
      )}

      {fields.length > 0 && (
        <View style={local.seleccionados}>
          {fields.map((field, index) => {
            const insumo = insumos.find((i) => i.id === field.insumoId);
            return (
              <View key={field.id} style={local.insumoRow}>
                <View style={local.insumoTextos}>
                  <Text style={local.insumoNombre}>{insumo?.nombre}</Text>
                  <Text style={local.insumoDetalle}>{insumo?.unidadMedida}</Text>
                </View>
                <Controller
                  control={control}
                  name={`insumosUtilizados.${index}.dosis`}
                  rules={{ required: true, min: 1 }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TextInput
                        style={[
                          local.cantidadInput,
                          errors.insumosUtilizados?.[index]?.dosis && local.cantidadInputError,
                        ]}
                        keyboardType="numeric"
                        value={String(value)}
                        onChangeText={(text) => onChange(Number(text) || 1)}
                      />
                      {errors.insumosUtilizados?.[index]?.dosis && (
                        <Text style={local.errorText}>≥ 1</Text>
                      )}
                    </View>
                  )}
                />
                <TouchableOpacity onPress={() => remove(index)} style={local.removeBtn}>
                  <MaterialIcons name="close" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const local = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    width: '100%',
  },
  resultados: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    width: '100%',
  },
  sinResultados: { padding: 12, color: '#999', fontSize: 14 },
  resultadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  resultadoTextos: { flex: 1, marginRight: 8 },
  resultadoNombre: { fontSize: 15, fontWeight: '500', color: '#111' },
  resultadoDetalle: { fontSize: 12, color: '#888', marginTop: 2 },
  seleccionados: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  insumoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    gap: 8,
  },
  insumoTextos: { flex: 1 },
  insumoNombre: { fontSize: 14, fontWeight: '500', color: '#111' },
  insumoDetalle: { fontSize: 12, color: '#888' },
  cantidadInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 15,
  },
  removeBtn: { padding: 4 },
  cantidadInputError: { borderColor: '#E53935' },
  errorText: { fontSize: 11, color: '#E53935', textAlign: 'center' },
});

export default InsumosForm;
