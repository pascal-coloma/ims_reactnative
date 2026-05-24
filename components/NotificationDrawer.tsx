import mockNotificaciones from '@/data/constants/mockNotificaciones';
import { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import NotificationCard from './NotificationCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

const NotificationDrawer = ({ visible, onClose }: Props) => {
  const translateX = useSharedValue(DRAWER_WIDTH);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : DRAWER_WIDTH, { duration: 280 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={style.overlay} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[style.drawer, { paddingTop: insets.top + 16 }, animatedStyle]}>
        <View style={style.header}>
          <Text style={style.titulo}>Notificaciones</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={style.cerrar}>✕</Text>
          </TouchableOpacity>
        </View>
        {__DEV__ ? (
          mockNotificaciones.map((n, i) => <NotificationCard key={i} notificacion={n} />)
        ) : (
          <Text style={style.sinNotifs}>Sin notificaciones</Text>
        )}
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
  sinNotifs: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default NotificationDrawer;
