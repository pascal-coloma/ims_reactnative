import AppHeader from '@/components/AppHeader';
import { usePersonal } from '@/context/PersonalContext';
import styles from '@/styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
    Pressable,
    FlatList,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// TODO: revisar id's de roles
const ROLES = [
    { label: 'Médico', value: 2 },
    { label: 'TENS', value: 3 },
    { label: 'Chofer', value: 4 },
    { label: 'Control', value: 1 },
];

type FormWorker = {
    first_name: string;
    last_name: string;
    rut: string;
    rol_id: number;
};

const RegistrarWorker = () => {
    const { registrarWorker } = usePersonal();
    const [rolModalVisible, setRolModalVisible] = useState(false);
    const [resultado, setResultado] = useState<{ totp_uri: string; password: string } | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm<FormWorker>({
        defaultValues: { first_name: '', last_name: '', rut: '', rol_id: 0 },
    });

    const formatearRut = (rut: string): string => {
        const clean = rut.replace(/[^0-9kK]/g, '');
        if (clean.length <= 1) return clean;
        const cuerpo = clean.slice(0, -1);
        const dv = clean.slice(-1);
        return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
    };

    const onSubmit = async (data: FormWorker) => {
        setCargando(true);
        setError(null);
        try {
            const rutLimpio = data.rut.replace(/\./g, '');
            const result = await registrarWorker({ ...data, rut: rutLimpio });
            if (!result) throw new Error('Error al registrar trabajador');
            setResultado(result);
            reset();
        } catch (e: any) {
            setError(e.message ?? 'Error desconocido');
        } finally {
            setCargando(false);
        }
    };

    if (resultado) {
        return (
            <View style={style.container}>
                <AppHeader
                    title="Trabajador Registrado"
                    onBack={() => setResultado(null)}
                />

                <View style={style.resultadoCard}>
                    <MaterialIcons
                        name="check-circle"
                        size={60}
                        color="#22c55e"
                        style={{ alignSelf: 'center', marginBottom: 16 }}
                    />
                    <Text style={style.resultadoTitulo}>¡Trabajador creado exitosamente!</Text>

                    <Text style={style.resultadoLabel}>Contraseña</Text>
                    <View style={style.resultadoValor}>
                        <TextInput
                            value={resultado.password}
                            editable={false}
                            selectTextOnFocus
                            style={style.resultadoCodigo}
                        />
                    </View>

                    <Text style={style.resultadoLabel}>QR para Google Authenticator</Text>
                    <Text style={style.resultadoSubtitulo}>
                        El trabajador debe escanear este código con Google Authenticator antes de iniciar sesión.
                    </Text>
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <QRCode value={resultado.totp_uri} size={200} color="#000" backgroundColor="#fff" />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => { setResultado(null); router.back(); }}>
                        <Text style={styles.buttonText}>Volver al panel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <>
            <AppHeader title="Registrar Trabajador" />
            <ScrollView>
                <View style={style.formulario}>
                    {error && (
                        <View style={style.errorBanner}>
                            <Text style={style.errorTexto}>{error}</Text>
                        </View>
                    )}

                    <Text style={style.label}>Nombre</Text>
                    <Controller
                        control={control}
                        name="first_name"
                        rules={{ required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder="Ingrese nombre"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={style.input}
                            />
                        )}
                    />
                    {errors.first_name && <Text style={style.campoRequerido}>Campo requerido</Text>}

                    <Text style={style.label}>Apellido</Text>
                    <Controller
                        control={control}
                        name="last_name"
                        rules={{ required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder="Ingrese apellido"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={style.input}
                            />
                        )}
                    />
                    {errors.last_name && <Text style={style.campoRequerido}>Campo requerido</Text>}

                    <Text style={style.label}>RUT</Text>
                    <Controller
                        control={control}
                        name="rut"
                        rules={{ required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder="12.345.678-9"
                                onBlur={onBlur}
                                onChangeText={(text) => onChange(formatearRut(text))}
                                value={value}
                                style={style.input}
                            />
                        )}
                    />
                    {errors.rut && <Text style={style.campoRequerido}>Campo requerido</Text>}

                    <Text style={style.label}>Cargo</Text>
                    <Controller
                        control={control}
                        name="rol_id"
                        rules={{ required: true, validate: (v) => v !== 0 || 'Seleccione un rol' }}
                        render={({ field: { onChange, value } }) => {
                            const seleccionado = ROLES.find((r) => r.value === value);
                            return (
                                <>
                                    <TouchableOpacity style={style.picker} onPress={() => setRolModalVisible(true)}>
                                        <Text style={seleccionado ? style.pickerTexto : style.pickerPlaceholder}>
                                            {seleccionado?.label ?? 'Seleccione un cargo'}
                                        </Text>
                                        <MaterialIcons name="expand-more" size={20} color="#666" />
                                    </TouchableOpacity>

                                    <Modal visible={rolModalVisible} transparent animationType="fade">
                                        <Pressable style={style.modalBackdrop} onPress={() => setRolModalVisible(false)}>
                                            <View style={style.modalCard}>
                                                <Text style={style.modalTitulo}>Seleccionar cargo</Text>
                                                <FlatList
                                                    data={ROLES}
                                                    keyExtractor={(item) => String(item.value)}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={[style.modalItem, value === item.value && style.modalItemActivo]}
                                                            onPress={() => {
                                                                onChange(item.value);
                                                                setRolModalVisible(false);
                                                            }}
                                                        >
                                                            <Text
                                                                style={[
                                                                    style.modalTexto,
                                                                    value === item.value && { color: 'white', fontWeight: 'bold' },
                                                                ]}
                                                            >
                                                                {item.label}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />
                                            </View>
                                        </Pressable>
                                    </Modal>
                                </>
                            );
                        }}
                    />
                    {errors.rol_id && <Text style={style.campoRequerido}>{errors.rol_id.message}</Text>}

                    <TouchableOpacity
                        style={[styles.button, cargando && { opacity: 0.6 }]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={cargando}
                    >
                        <Text style={styles.buttonText}>{cargando ? 'Registrando...' : 'Registrar'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
};

const style = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fff' },
    header: { flexDirection: 'row', gap: 20, alignItems: 'center', padding: 10 },
    formulario: { padding: 20, backgroundColor: 'white' },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#333' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    campoRequerido: { color: '#E53935', textAlign: 'right', marginBottom: 8 },
    errorBanner: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#E53935',
    },
    errorTexto: { color: '#E53935', fontSize: 13 },
    picker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    pickerTexto: { fontSize: 16, color: '#111' },
    pickerPlaceholder: { fontSize: 16, color: '#aaa' },
    modalBackdrop: { flex: 1, backgroundColor: '#00000055', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
    modalTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    modalItem: { padding: 14, borderRadius: 8, marginBottom: 6 },
    modalItemActivo: { backgroundColor: '#E53935' },
    modalTexto: { fontSize: 14, color: '#333', fontWeight: '500' },
    resultadoCard: { margin: 16, padding: 20, backgroundColor: 'white', borderRadius: 12 },
    resultadoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#111',
    },
    resultadoLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 8,
    },
    resultadoValor: { backgroundColor: '#F7F7F7', borderRadius: 8, padding: 12, marginBottom: 20 },
    resultadoCodigo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
        letterSpacing: 2,
    },
    resultadoSubtitulo: { fontSize: 13, color: '#666', marginBottom: 16 },
    qrPlaceholder: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        marginBottom: 24,
    },
});

export default RegistrarWorker;
