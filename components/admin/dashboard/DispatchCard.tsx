import { Text, View } from 'react-native';
import styles from '@/styles/globalStyles';
import { useDespachos } from '@/context/DespachosContext';
import { useAuth } from '@/context/AuthContext';

const DispatchCard = () => {
  const { user } = useAuth();
  const { despachos } = useDespachos();
  const esControl = user?.role === 'control';

  const enCurso = despachos.filter(
    (d) => d.estado === 'activo' || d.estado === 'emergencia',
  ).length;
  const recibidos = esControl ? despachos.filter((d) => d.estado === 'recibido').length : 0;
  const activos = recibidos + enCurso;

  return (
    <View style={styles.container}>
      <View style={styles.redCard}>
        <Text style={styles.redCardTitle}>Despachos Activos</Text>
        <Text style={styles.dispNumb}>{activos}</Text>
        <View style={styles.redCardPills}>
          {esControl && <Text style={styles.pill}>{recibidos} recibidos</Text>}
          <Text style={styles.pill}>{enCurso} en curso</Text>
        </View>
      </View>
    </View>
  );
};

export default DispatchCard;
