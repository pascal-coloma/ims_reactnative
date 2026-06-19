import AppHeader from '@/components/AppHeader';
import { useGrupos } from '@/context/GrupoContext';
import { usePersonal } from '@/context/PersonalContext';
import styles from '@/styles/globalStyles';
import { traducirRol } from '@/utils/labels';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Grupo } from '@/data/types';
import { fetchConSesion } from '@/context/AuthContext';

const ROL_COLOR: Record<string, string> = {
  control: '#1976D2',
  medic: '#E53935',
  nurse: '#7B1FA2',
  driver: '#2E7D32',
};

const DetalleGrupo = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { personal } = usePersonal();
  const { agregarMiembro, removerMiembro } = useGrupos();

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personalSeleccionado, setPersonalSeleccionado] = useState<number | null>(null);
  const [confirmarRut, setConfirmarRut] = useState<string | null>(null);

  const cargarGrupo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchConSesion(`/ims/api/grupo/?group_id=${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const list: Grupo[] = await response.json();
      setGrupo(list[0] ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar grupo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConSesion(`/ims/api/grupo/?group_id=${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<Grupo[]>;
      })
      .then((list) => {
        setGrupo(list[0] ?? null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Error al cargar grupo');
        setLoading(false);
      });
  }, [id]);

  const handleRemover = async () => {
    if (!grupo || !confirmarRut) return;
    const p = personal.find((x) => x.rut === confirmarRut);
    if (!p) return;
    setConfirmarRut(null);
    setAccionando(true);
    setError(null);
    try {
      await removerMiembro(grupo.grupo_id, parseInt(p.id, 10));
      await cargarGrupo();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al remover miembro');
    } finally {
      setAccionando(false);
    }
  };

  const handleAgregar = async () => {
    if (!grupo || personalSeleccionado === null) return;
    setAccionando(true);
    setError(null);
    try {
      await agregarMiembro(grupo.grupo_id, personalSeleccionado);
      setPersonalSeleccionado(null);
      await cargarGrupo();
    } catch (e: unknown) {
      if (e instanceof Error && (e as Error & { status?: number }).status === 409) {
        setError('Este miembro ya pertenece al grupo');
      } else {
        setError(e instanceof Error ? e.message : 'Error al agregar miembro');
      }
    } finally {
      setAccionando(false);
    }
  };

  const rutsMiembros = new Set(grupo?.miembros.map((m) => m.rut) ?? []);
  const noSuscritos = personal.filter((p) => p.is_active && !rutsMiembros.has(p.rut));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <AppHeader title="Grupo" />
        <ActivityIndicator style={{ marginTop: 40 }} color="#E53935" size="large" />
      </View>
    );
  }

  if (!grupo) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <AppHeader title="Grupo" />
        <View style={styles.container}>
          <Text style={styles.subtitle}>Grupo no encontrado</Text>
        </View>
      </View>
    );
  }

  const miembroAConfirmar = grupo.miembros.find((m) => m.rut === confirmarRut);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Modal
          visible={confirmarRut !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmarRut(null)}
        >
          <Pressable style={local.modalOverlay} onPress={() => setConfirmarRut(null)}>
            <Pressable style={local.modalCard} onPress={() => {}}>
              <View style={local.modalIconWrap}>
                <MaterialIcons name="person-remove" size={28} color="#E53935" />
              </View>
              <Text style={local.modalTitle}>Remover miembro</Text>
              <Text style={local.modalBody}>
                ¿Deseas remover a{' '}
                <Text style={{ fontWeight: 'bold' }}>{miembroAConfirmar?.nombre}</Text> del grupo?
              </Text>
              <View style={local.modalActions}>
                <TouchableOpacity
                  style={local.modalCancelBtn}
                  onPress={() => setConfirmarRut(null)}
                >
                  <Text style={local.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={local.modalConfirmBtn} onPress={handleRemover}>
                  <Text style={local.modalConfirmText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <AppHeader title={grupo.grupo_nombre} />

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={local.seccion}>Miembros ({grupo.miembros.length})</Text>

          {grupo.miembros.length === 0 ? (
            <Text style={local.vacio}>Sin miembros</Text>
          ) : (
            grupo.miembros.map((m, index) => (
              <View key={m.rut} style={[local.card, index % 2 === 1 && local.cardAlterna]}>
                <View style={[local.avatar, { backgroundColor: ROL_COLOR[m.rol] ?? '#999' }]}>
                  <Text style={local.avatarText}>{m.nombre[0]?.toUpperCase()}</Text>
                </View>
                <View style={local.cardBody}>
                  <Text style={local.nombre}>{m.nombre}</Text>
                  <Text style={local.rut}>{m.rut}</Text>
                </View>
                <View style={[local.rolPill, { backgroundColor: ROL_COLOR[m.rol] ?? '#999' }]}>
                  <Text style={local.rolTexto}>{traducirRol(m.rol)}</Text>
                </View>
                <TouchableOpacity
                  style={local.removerBtn}
                  onPress={() => setConfirmarRut(m.rut)}
                  disabled={accionando}
                >
                  <MaterialIcons name="person-remove" size={18} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={[local.seccion, { marginTop: 24 }]}>Agregar miembro</Text>

          {noSuscritos.length === 0 ? (
            <Text style={local.vacio}>Todo el personal activo ya está en el grupo</Text>
          ) : (
            <>
              {noSuscritos.map((p, index) => {
                const pid = parseInt(p.id, 10);
                const seleccionado = personalSeleccionado === pid;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      local.selectorItem,
                      index % 2 === 1 && local.selectorItemAlterna,
                      seleccionado && local.selectorItemActivo,
                    ]}
                    onPress={() => setPersonalSeleccionado(seleccionado ? null : pid)}
                  >
                    <View style={[local.radio, seleccionado && local.radioActivo]}>
                      {seleccionado && <View style={local.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={local.itemNombre}>
                        {p.first_name} {p.last_name}
                      </Text>
                      <Text style={local.itemRut}>{p.rut}</Text>
                    </View>
                    <View
                      style={[
                        local.rolPill,
                        { backgroundColor: ROL_COLOR[p.rol_nombre] ?? '#999' },
                      ]}
                    >
                      <Text style={local.rolTexto}>{traducirRol(p.rol_nombre)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.button,
                  { marginTop: 16, opacity: personalSeleccionado === null || accionando ? 0.5 : 1 },
                ]}
                onPress={handleAgregar}
                disabled={personalSeleccionado === null || accionando}
              >
                {accionando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Agregar</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {error && <Text style={local.error}>{error}</Text>}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const local = StyleSheet.create({
  seccion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  vacio: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    elevation: 1,
  },
  cardAlterna: {
    backgroundColor: '#F3F4F6',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  rut: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rolPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  rolTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  removerBtn: {
    padding: 4,
  },
  selectorItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorItemAlterna: {
    backgroundColor: '#F3F4F6',
  },
  selectorItemActivo: {
    borderColor: '#E53935',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActivo: {
    borderColor: '#E53935',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  itemRut: {
    fontSize: 12,
    color: '#888',
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fce4e4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  modalBody: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#E53935',
    borderRadius: 24,
    padding: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DetalleGrupo;
