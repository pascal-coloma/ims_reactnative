import { StyleSheet, Text, View } from 'react-native';
import { ESTADO_COLOR } from '@/utils/despacho';

type Props = {
  estado: string;
};

const EstadoBadge = ({ estado }: Props) => (
  <View style={[style.badge, { backgroundColor: ESTADO_COLOR[estado] ?? '#999' }]}>
    <Text style={style.texto}>{estado[0].toUpperCase() + estado.slice(1)}</Text>
  </View>
);

const style = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  texto: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default EstadoBadge;
