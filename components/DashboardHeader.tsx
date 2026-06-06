// components/DashboardHeader.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationDrawer from './NotificationDrawer';
import SettingsDrawer from './SettingsDrawer';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardHeader = () => {
  const [notifVisible, setNotifVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  const nombre = `${user?.first_name} ${user?.last_name}`;

  return (
    <>
      <View style={[style.container, { paddingTop: insets.top + 8 }]}>
        <View style={style.left}>
          <View style={style.avatar}>
            <Text style={style.avatarText}>{user?.first_name?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View>
            <Text style={style.welcome}>Bienvenido/a,</Text>
            <Text style={style.nombre}>{nombre}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={style.right}>
          <TouchableOpacity onPress={() => setNotifVisible(true)}>
            <View style={style.bellContainer}>
              <MaterialIcons name="notifications-none" size={24} color="#000" />
              {unreadCount > 0 && (
                <View style={style.badge}>
                  <Text style={style.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <NotificationDrawer visible={notifVisible} onClose={() => setNotifVisible(false)} />
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <MaterialIcons name="settings" size={24} color="#000" />
          </TouchableOpacity>
          <SettingsDrawer visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
        </View>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 12,
    color: '#666',
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  right: {
    flexDirection: 'row',
    gap: 16,
  },
  bellContainer: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

export default DashboardHeader;
