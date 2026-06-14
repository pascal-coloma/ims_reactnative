import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatearSugerencia, useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';

type AddressAutocompleteProps = {
  onSelect: (address: string, comuna: string) => void;
  placeholder?: string;
  defaultValue?: string;
};

export default function AddressAutocomplete({
  onSelect,
  placeholder,
  defaultValue,
}: AddressAutocompleteProps) {
  const { query, suggestions, isLoading, handleInputChange, handleSelect, clear } =
    useAddressAutocomplete({ onSelect, defaultValue });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder ?? 'Ingresa una dirección'}
          value={query}
          onChangeText={handleInputChange}
        />
        {isLoading && <ActivityIndicator style={styles.loader} size="small" color="#999" />}
        {!isLoading && query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clear}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <ScrollView style={styles.listView} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.row}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.rowText}>{formatearSugerencia(item)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  loader: {
    position: 'absolute',
    right: 12,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    fontSize: 14,
  },
});
