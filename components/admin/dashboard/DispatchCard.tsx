import { Text, View } from 'react-native';
import styles from '@/styles/globalStyles';
import { useDespachos } from '@/context/DespachosContext';

const DispatchCard = () => {
  const { despachos } = useDespachos();

  const activos = despachos.length;
  const pendientes = despachos.filter((d) => d.estado === 'pendiente').length;
  const enCurso = despachos.filter((d) => d.estado === 'activo').length;

  return (
    <View style={styles.container}>
      <View style={styles.redCard}>
        <Text style={styles.redCardTitle}>Despachos Activos</Text>
        <Text style={styles.dispNumb}>{activos}</Text>
        <View style={styles.redCardPills}>
          <Text style={styles.pill}>{pendientes} pendientes</Text>
          <Text style={styles.pill}>{enCurso} en curso</Text>
        </View>
      </View>
    </View>
  );
};

export default DispatchCard;
