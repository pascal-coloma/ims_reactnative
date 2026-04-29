import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Notificacion } from '@/constants/mockNotificaciones';

const tipoConfig: Record<Notificacion['tipo'], { icon: string; color: string; bg: string }> = {
  despacho: { icon: 'airport-shuttle', color: '#2563eb', bg: '#eff6ff' },
  reasignacion: { icon: 'people', color: '#d97706', bg: '#fffbeb' },
  alerta_stock: { icon: 'warning', color: '#dc2626', bg: '#fef2f2' },
  sistema: { icon: 'info', color: '#16a34a', bg: '#f0fdf4' },
};

const NotificationCard = ({ notificacion }: { notificacion: Notificacion }) => {
  const config = tipoConfig[notificacion.tipo];

  return (
    <View style={style.card}>
      <View style={[style.iconContainer, { backgroundColor: config.bg }]}>
        <MaterialIcons name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={style.contenido}>
        <Text style={[style.titulo, { color: config.color }]}>{notificacion.titulo}</Text>
        <Text style={style.mensaje}>{notificacion.mensaje}</Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '600',
  },
  mensaje: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default NotificationCard;
