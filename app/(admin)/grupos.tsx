import AppHeader from '@/components/AppHeader';
import { useGrupos } from '@/context/GrupoContext';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const Grupos = () => {
  const { grupos, loading } = useGrupos();

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Grupos" />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#E53935" size="large" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}>
          {grupos.length === 0 ? (
            <Text style={local.empty}>No hay grupos registrados</Text>
          ) : (
            grupos.map((g, index) => (
              <TouchableOpacity
                key={g.grupo_id}
                style={[local.card, index % 2 === 1 && local.cardAlterna]}
                onPress={() => router.push(`/(admin)/(grupo)/${g.grupo_id}`)}
              >
                <View style={local.cardIcon}>
                  <MaterialIcons name="group" size={28} color="#E53935" />
                </View>
                <View style={local.cardBody}>
                  <Text style={local.nombre}>{g.grupo_nombre}</Text>
                  <Text style={local.conteo}>
                    {g.miembros.length} miembro{g.miembros.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#ccc" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <View style={local.footer}>
        <TouchableOpacity
          style={local.crearBtn}
          onPress={() => router.push('/(admin)/crear-grupo')}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={local.crearBtnText}>Crear grupo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const local = StyleSheet.create({
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 1,
  },
  cardAlterna: {
    backgroundColor: '#F3F4F6',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fce4e4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  conteo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  crearBtn: {
    backgroundColor: '#E53935',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  crearBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Grupos;
