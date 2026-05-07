import mockNotificaciones from '@/data/constants/mockNotificaciones';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationCard from './NotificationCard';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const NotificationDrawer = ({ visible, onClose }: Props) => {
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={style.overlay} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[style.drawer, { transform: [{ translateX }] }]}>
        <View style={style.header}>
          <Text style={style.titulo}>Notificaciones</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={style.cerrar}>✕</Text>
          </TouchableOpacity>
        </View>
        {mockNotificaciones.map((n) => (
          <NotificationCard key={n.titulo} notificacion={n} />
        ))}
      </Animated.View>
    </Modal>
  );
};

const style = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: 20,
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
});

export default NotificationDrawer;
