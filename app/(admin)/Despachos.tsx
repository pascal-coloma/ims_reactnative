import ListaDespachos from '@/components/admin/ListaDespachos';
import AppHeader from '@/components/AppHeader';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Despachos = () => {
  const router = useRouter();
  return (
    <>
      <AppHeader title='Despachos' />
      <ListaDespachos />
    </>
  );
};

const style = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    padding: 10,
  },
});

export default Despachos;
