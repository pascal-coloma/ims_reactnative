import { usePersonal } from '@/context/PersonalContext';
import AppHeader from '@/components/AppHeader';
import styles from '@/styles/globalStyles';
import { traducirRol } from '@/utils/labels';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const ROL_COLOR: Record<string, string> = {
  control: '#1976D2',
  medic: '#E53935',
  nurse: '#7B1FA2',
  driver: '#2E7D32',
};

const ROL_ORDEN = ['control', 'medic', 'nurse', 'driver'];

const ListaPersonal = () => {
  const { personal } = usePersonal();
  const [busqueda, setBusqueda] = useState('');

  const filtrado = busqueda.trim()
    ? personal.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.rut.includes(busqueda.replace(/\./g, '')),
      )
    : personal;

  const agrupado = ROL_ORDEN.reduce<Record<string, typeof personal>>((acc, rol) => {
    const grupo = filtrado.filter((p) => p.rol_nombre === rol);
    if (grupo.length > 0) acc[rol] = grupo;
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Personal" />

      <View style={local.searchContainer}>
        <TextInput
          style={local.buscador}
          placeholder="Buscar por nombre o RUT..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {Object.entries(agrupado).length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.subtitle}>Sin resultados</Text>
          </View>
        ) : (
          <>
            {Object.entries(agrupado).map(([rol, grupo]) => (
              <View key={rol}>
                <View style={local.grupoHeader}>
                  <View
                    style={[local.grupoIndicador, { backgroundColor: ROL_COLOR[rol] ?? '#999' }]}
                  />
                  <Text style={local.grupoTitulo}>{traducirRol(rol)}</Text>
                  <Text style={local.grupoConteo}>{grupo.length}</Text>
                </View>
                {grupo.map((p) => (
                  <View key={p.id} style={local.card}>
                    <View style={local.cardLeft}>
                      <View
                        style={[
                          local.avatar,
                          { backgroundColor: ROL_COLOR[p.rol_nombre] ?? '#999' },
                        ]}
                      >
                        <Text style={local.avatarText}>
                          {p.first_name?.[0]?.toUpperCase()}
                          {p.last_name?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={local.cardBody}>
                      <Text style={local.nombre}>
                        {p.first_name} {p.last_name}
                      </Text>
                      <Text style={local.rut}>{p.rut}</Text>
                    </View>
                    <View
                      style={[
                        local.rolPill,
                        { backgroundColor: ROL_COLOR[p.rol_nombre] ?? '#999' },
                      ]}
                    >
                      <Text style={local.rolTexto}>{traducirRol(p.rol_nombre)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const local = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    elevation: 1,
  },
  cardLeft: {
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardBody: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  rut: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rolPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rolTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  grupoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  grupoIndicador: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  grupoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  grupoConteo: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});

export default ListaPersonal;
