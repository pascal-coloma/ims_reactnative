import { useNotifications } from '@/context/NotificationContext';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const NotificationDrawer = ({ visible, onClose }: Props) => {
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const insets = useSafeAreaInsets();
  const { notifications, dismissNotification, markAllRead } = useNotifications();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 280,
      useNativeDriver: true,
    }).start();
    if (visible) markAllRead();
  }, [visible, markAllRead]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={style.overlay} onPress={onClose} activeOpacity={1} />
      <Animated.View
        style={[style.drawer, { paddingTop: insets.top + 16, transform: [{ translateX }] }]}
      >
        <View style={style.header}>
          <Text style={style.titulo}>Notificaciones</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={style.cerrar}>✕</Text>
          </TouchableOpacity>
        </View>
        {notifications.length === 0 ? (
          <Text style={style.empty}>Sin notificaciones</Text>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onPress={() => dismissNotification(n.id)}
            />
          ))
        )}
      </Animated.View>
    </Modal>
  );
};

const style = StyleSheet.create({
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
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default NotificationDrawer;
