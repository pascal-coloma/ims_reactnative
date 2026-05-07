import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationDrawer from '../NotificationDrawer';
import { useState } from 'react';
import SettingsDrawer from '../SettingsDrawer';
import { useAuth } from '@/context/AuthContext';

const UserHeader = () => {
  const [notifVisible, setNotifVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <View style={style.container}>
        <View style={style.left}>
          <View style={style.avatar}>
            <Text style={style.avatarText}>A</Text>
          </View>
          <View>
            <Text style={style.welcome}>Bienvenido,</Text>
            <Text style={style.role}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={style.right}>
          <TouchableOpacity onPress={() => setNotifVisible(true)}>
            <MaterialIcons name="notifications-none" size={24} color="#000" />
          </TouchableOpacity>
          <NotificationDrawer
            visible={notifVisible}
            onClose={() => setNotifVisible(false)}
          ></NotificationDrawer>
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
    height: '10%',
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
  role: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  right: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default UserHeader;
