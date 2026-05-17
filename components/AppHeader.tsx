import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AppHeaderProps = {
  title: string;
  onBack?: () => void;
};

const AppHeader = ({ title, onBack }: AppHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[style.container, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={onBack ?? (() => router.back())}>
        <MaterialIcons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>
      <Text style={style.title}>{title}</Text>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
});

export default AppHeader;
