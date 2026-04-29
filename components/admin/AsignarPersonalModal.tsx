import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { usePersonal } from '@/context/PersonalContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AsignarPersonalModal = ({ visible, onClose }: Props) => {
  const { personal, actualizarDisponilidad } = usePersonal();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.23)' }}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
          maxHeight: '60%',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Asignar Personal</Text>

        <FlatList
          data={personal}
          keyExtractor={(pers) => pers.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                actualizarDisponilidad(item.id);
                onClose();
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                opacity: item.disponible ? 1 : 0.4,
              }}
              disabled={!item.disponible}
            >
              <View>
                <Text style={{ fontWeight: 'bold' }}>{item.nombre}</Text>
                <Text style={{ color: '#888' }}>{item.rol}</Text>
              </View>
              <Text style={{ color: item.disponible ? '#22c55e' : '#ef4444' }}>
                {item.disponible ? 'Disponible' : 'Ocupado'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

export default AsignarPersonalModal;
