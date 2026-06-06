import { useAuth } from '@/context/AuthContext';
import { traducirRol } from '@/utils/labels';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SettingsDrawer = ({ visible, onClose }: Props) => {
  const { user, logout } = useAuth();
  const [translateX] = useState(() => new Animated.Value(DRAWER_WIDTH));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const iniciales = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase();
  const rolLabel = traducirRol(user?.role ?? '');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={local.overlay} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[local.drawer, { paddingTop: insets.top + 16, transform: [{ translateX }] }]}
      >
        <View style={local.header}>
          <Text style={local.titulo}>Perfil</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={local.cerrar}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={local.perfilContainer}>
          <View style={local.avatarGrande}>
            <Text style={local.avatarGrandeTexto}>{iniciales}</Text>
          </View>
          <Text style={local.nombreTexto}>
            {user?.first_name} {user?.last_name}
          </Text>
          <View style={local.rolBadge}>
            <Text style={local.rolTexto}>{rolLabel}</Text>
          </View>
        </View>

        <View style={local.divisor} />

        <View style={local.infoContainer}>
          <View style={local.infoFila}>
            <MaterialIcons name="person" size={16} color="#888" />
            <Text style={local.infoLabel}>Usuario</Text>
            <Text style={local.infoValor}>{user?.username ?? '—'}</Text>
          </View>
          <View style={local.infoFila}>
            <MaterialIcons name="badge" size={16} color="#888" />
            <Text style={local.infoLabel}>Rol</Text>
            <Text style={local.infoValor}>{rolLabel}</Text>
          </View>
        </View>

        <View style={local.divisor} />

        <TouchableOpacity
          style={local.btnLogout}
          onPress={() => {
            onClose();
            logout();
          }}
        >
          <MaterialIcons name="logout" size={18} color="#E53935" />
          <Text style={local.btnLogoutTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const local = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cerrar: {
    fontSize: 18,
    color: '#94a3b8',
  },
  perfilContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  avatarGrande: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarGrandeTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
  },
  nombreTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  rolBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolTexto: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: '600',
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  infoContainer: {
    gap: 12,
  },
  infoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  infoValor: {
    fontSize: 13,
    color: '#111',
    fontWeight: '500',
  },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E53935',
    justifyContent: 'center',
  },
  btnLogoutTexto: {
    color: '#E53935',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default SettingsDrawer;
