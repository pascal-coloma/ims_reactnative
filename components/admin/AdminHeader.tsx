import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationDrawer from '../NotificationDrawer';
import { useState } from 'react';

const AdminHeader = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      <View style={style.container}>
        <View style={style.left}>
          <View style={style.avatar}>
            <Text style={style.avatarText}>A</Text>
          </View>
          <View>
            <Text style={style.welcome}>Bienvenido,</Text>
            <Text style={style.role}>Administrador</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={style.right}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <MaterialIcons name="notifications-none" size={24} color="#000" />
          </TouchableOpacity>
          <NotificationDrawer
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
          ></NotificationDrawer>
          <MaterialIcons name="settings" size={24} color="#000" />
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

export default AdminHeader;
