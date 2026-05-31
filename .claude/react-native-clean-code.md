---
name: react-native-clean-code
description: >
  Genera, revisa y refactoriza código React Native siguiendo las mejores prácticas
  oficiales de React Native, Expo y desarrollo móvil para iOS y Android. Usa esta
  skill siempre que el usuario pida escribir, revisar o mejorar código React Native,
  incluyendo componentes nativos, StyleSheet, navegación, rendimiento en listas,
  manejo de teclado, permisos, notificaciones push, acceso a hardware (cámara, GPS,
  biometría), o cuando detectes code smells como inline styles, FlatList sin
  optimización, renders innecesarios, lógica de negocio en componentes, bridge calls
  excesivos, o código de plataforma sin abstracción. También aplica al revisar PRs,
  auditar proyectos, o generar prompts de Claude Code para proyectos React Native.
---

# React Native Clean Code Skill

Genera y revisa código React Native aplicando las mejores prácticas oficiales.
Cada decisión debe poder citarse contra una fuente concreta.

## Fuentes de verdad

| Fuente | URL | Cubre |
|--------|-----|-------|
| React Native Docs | reactnative.dev/docs | componentes, APIs, plataforma |
| React Native Performance | reactnative.dev/docs/performance | JS thread, renders |
| Expo Docs | docs.expo.dev | SDK, EAS, permisos |
| React Navigation | reactnavigation.org/docs | navegación, deep linking |
| React Native StyleSheet | reactnative.dev/docs/stylesheet | estilos, optimización |

---

## Reglas de componentes

### 1. `StyleSheet.create` sobre inline styles
```tsx
// ❌ Inline styles — nuevo objeto en cada render, sin optimización
<View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>

// ✅ StyleSheet.create — optimizado por el bridge nativo, validado en dev
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});
<View style={styles.container}>
```
**Fuente:** reactnative.dev/docs/stylesheet — *"StyleSheet validates the content of the style."*

### 2. Separar lógica de negocio de la UI
```tsx
// ❌ Fetch, transformación y render en el mismo componente
function UserScreen() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(u => {
      setUser({ ...u, fullName: `${u.first} ${u.last}` });
    });
  }, []);
  return <Text>{user?.fullName}</Text>;
}

// ✅ Hook para la lógica, componente solo para UI
function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser(id).then(setUser) }, [id]);
  const fullName = user ? `${user.first} ${user.last}` : '';
  return { user, fullName };
}

function UserScreen({ userId }: { userId: string }) {
  const { fullName } = useUser(userId);
  return <Text>{fullName}</Text>;
}
```

### 3. Código específico de plataforma en abstracciones
```tsx
// ❌ Bifurcación de plataforma directa en el componente
<View style={{
  shadowColor: '#000',          // solo iOS
  elevation: 4,                 // solo Android
}}>

// ✅ Abstracción en StyleSheet o componente propio
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

---

## Reglas de listas

### 4. `FlatList` con `keyExtractor` y `getItemLayout`
```tsx
// ❌ Sin keyExtractor — React usa el índice, re-renders incorrectos
<FlatList data={items} renderItem={({ item }) => <Item data={item} />} />

// ✅ Con optimizaciones
<FlatList
  data={items}
  keyExtractor={(item) => item.id}           // estable, no el índice
  getItemLayout={(_, index) => ({            // saltar scroll virtualizado
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}                   // items visibles iniciales
  maxToRenderPerBatch={5}                   // items por batch de render
  windowSize={5}                            // ventana de renderizado
  removeClippedSubviews                     // Android: desmontar off-screen
  renderItem={renderItem}                   // función estable (fuera del render)
/>
```
**Fuente:** reactnative.dev/docs/optimizing-flatlist-configuration

### 5. `renderItem` como función estable
```tsx
// ❌ Arrow function inline — nueva referencia en cada render del padre
<FlatList renderItem={({ item }) => <ItemCard item={item} />} />

// ✅ Función definida fuera o memoizada
const renderItem = useCallback(
  ({ item }: { item: Product }) => <ItemCard item={item} />,
  []
);
<FlatList renderItem={renderItem} />
```

### 6. `ItemSeparatorComponent` en lugar de margin en items
```tsx
// ❌ Margin en cada item — el último item tiene margin innecesario
const ItemCard = () => <View style={{ marginBottom: 12 }}>...</View>;

// ✅ Separador explícito — el FlatList lo gestiona
<FlatList
  ItemSeparatorComponent={() => <View style={styles.separator} />}
  renderItem={renderItem}
/>
```

---

## Reglas de rendimiento

### 7. `React.memo` para items de lista
```tsx
// ✅ El item solo re-renderiza si sus props cambian
const ItemCard = React.memo(function ItemCard({ item }: { item: Product }) {
  return (
    <View style={styles.card}>
      <Text>{item.name}</Text>
    </View>
  );
});
```

### 8. Evitar re-renders del JS thread
```tsx
// ❌ Objeto nuevo en cada render — rompe React.memo del hijo
<Header style={{ color: 'red' }} /> // nueva ref siempre

// ✅ Estilo estático fuera del componente o en StyleSheet
const headerStyle = { color: 'red' } as const;
<Header style={headerStyle} />
```

### 9. `InteractionManager` para trabajo pesado post-navegación
```tsx
// ✅ Diferir operaciones costosas hasta que las animaciones terminen
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    loadHeavyData(); // corre después de que la animación de navegación termine
  });
  return () => task.cancel();
}, []);
```
**Fuente:** reactnative.dev/docs/interactionmanager

---

## Reglas de navegación

### 10. Tipado de rutas con React Navigation
```tsx
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

// En el componente
const navigation = useNavigation<NavigationProp<RootStackParamList>>();
const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();

// Navegar con tipos
navigation.navigate('Profile', { userId: '123' }); // ✅ type-safe
```

### 11. Limpiar listeners de navegación
```tsx
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadData();
  });
  return unsubscribe; // cleanup automático
}, [navigation]);
```

---

## Reglas de permisos y hardware

### 12. Pedir permisos en runtime, explicar el porqué
```tsx
async function requestCameraPermission() {
  // Mostrar explicación ANTES de pedir el permiso del sistema
  const shouldShow = await PermissionsAndroid.shouldShowRequestPermissionRationale(
    PermissionsAndroid.PERMISSIONS.CAMERA
  );

  if (shouldShow) {
    Alert.alert(
      'Permiso de cámara',
      'Necesitamos acceso a tu cámara para escanear documentos.',
      [{ text: 'Continuar', onPress: requestPermission }]
    );
    return;
  }

  await requestPermission();
}
```

### 13. Cleanup de subscriptions de hardware
```tsx
useEffect(() => {
  const watcher = Geolocation.watchPosition(
    (position) => handlePosition(position),
    (error) => handleError(error),
    { enableHighAccuracy: true, distanceFilter: 10 }
  );

  return () => Geolocation.clearWatch(watcher); // siempre limpiar
}, []);
```

### 14. Manejo del teclado en formularios
```tsx
// ✅ KeyboardAvoidingView para que el teclado no tape el input
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.container}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    <TextInput ... />
    <Button title="Enviar" />
  </ScrollView>
</KeyboardAvoidingView>
```

---

## Reglas de código de plataforma

### 15. Archivos `.ios.tsx` / `.android.tsx` para divergencias grandes
```
components/
  DatePicker.ios.tsx      // UIDatePicker nativo
  DatePicker.android.tsx  // DatePickerAndroid
  DatePicker.tsx          // fallback / tipos compartidos
```

### 16. `Platform.OS` para divergencias pequeñas
```tsx
const hitSlop = Platform.select({
  ios: { top: 10, bottom: 10, left: 10, right: 10 },
  android: undefined, // Android tiene touch target automático
});
```

---

## Checklist antes de generar código

- [ ] ¿Los estilos usan `StyleSheet.create` (no inline)?
- [ ] ¿Las `FlatList` tienen `keyExtractor`, `getItemLayout` y `renderItem` estable?
- [ ] ¿Los items de lista están envueltos en `React.memo`?
- [ ] ¿El código de plataforma está abstraído con `Platform.select` o archivos separados?
- [ ] ¿Las subscriptions de hardware tienen cleanup en `useEffect`?
- [ ] ¿Los permisos se piden en runtime con explicación previa?
- [ ] ¿La navegación está tipada con `RootStackParamList`?
- [ ] ¿El trabajo pesado post-navegación usa `InteractionManager`?
- [ ] ¿Los formularios tienen `KeyboardAvoidingView`?
- [ ] ¿La lógica de negocio está en hooks, no en componentes?

---

## Formato de justificación

```
refactor(products): optimize ProductList with FlatList tuning

reactnative.dev/docs/optimizing-flatlist-configuration
Added keyExtractor, getItemLayout, and memoized renderItem.
Removes inline renderItem arrow function that created new references
on every parent render, breaking React.memo on ProductCard.
```
