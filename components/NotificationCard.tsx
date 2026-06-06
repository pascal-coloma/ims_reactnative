import { type FcmNotification } from '@/context/NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  notification: FcmNotification;
  onPress: () => void;
};

const NotificationCard = ({ notification, onPress }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[style.card, !notification.read && style.unread]}
  >
    <View style={[style.iconContainer, !notification.read ? style.iconBgUnread : style.iconBgRead]}>
      <MaterialIcons
        name="notifications"
        size={20}
        color={notification.read ? '#64748b' : '#2563eb'}
      />
    </View>
    <View style={style.contenido}>
      <Text style={[style.titulo, !notification.read && style.tituloUnread]}>
        {notification.title}
      </Text>
      <Text style={style.mensaje}>{notification.body}</Text>
    </View>
  </TouchableOpacity>
);

const style = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  unread: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgUnread: {
    backgroundColor: '#dbeafe',
  },
  iconBgRead: {
    backgroundColor: '#f1f5f9',
  },
  contenido: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748b',
  },
  tituloUnread: {
    fontWeight: '600',
    color: '#1e40af',
  },
  mensaje: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default NotificationCard;
