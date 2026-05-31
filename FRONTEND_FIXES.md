# Frontend Fix Log — Backend Response Alignment

All fixes made to align the React Native frontend with actual backend response shapes.

---

## 1. `Ambulancia` Type (`data/constants/mockAmbulancia.ts`)

**Problem:** Type used `id: string`, `modelo: string`, `estado_disponibilidad` — none of which match what the backend returns.

**Backend shape** (`GET /ims/api/ambulancias/`):
```json
{
  "ambulancia_id": 1,
  "patente": "AMB-001",
  "estado": "disponible",
  "stock": []
}
```

**Fix:** Replace type entirely.
```ts
// BEFORE
export type Ambulancia = {
  id: string;
  patente: string;
  modelo: string;
  estado_disponibilidad: 'disponible' | 'en_despacho' | 'mantencion' | 'fuera_servicio';
};

// AFTER
export type AmbulanciaStock = {
  presentacion_id: number;
  insumo_nombre: string;
  insumo_cantidad: number;
  categoria: string;
  unidad_medida: string;
  stock: number;
};

export type Ambulancia = {
  ambulancia_id: number;
  patente: string;
  estado: 'disponible' | 'en_despacho' | 'mantencion' | 'fuera_servicio';
  stock: AmbulanciaStock[];
};
```

> `modelo` is not returned by the backend. Display only `patente` wherever ambulance info is shown.

---

## 2. `AmbulanciaContext.tsx`

**Problem:** Was converting `id` to string with `String(a.id)`, but the field is `ambulancia_id`, making every id `"undefined"`.

**Fix:**
```ts
// BEFORE
setAmbulancias(data.map((a: any) => ({ ...a, id: String(a.id) })));

// AFTER
setAmbulancias(data);
```

---

## 3. `InventoryContext.tsx`

**Problem:** Mapping assumed a flat `{ presentacion, ambulancia }` format.

**Actual backend shape** (`GET /ims/api/inv/`): Due to an import shadowing in `views.py`, both `/api/inv/` and `/api/ambulancias/` are served by `Ambulancia_package.gets.get_all()`. Response is **ambulance-grouped**:
```json
[
  {
    "ambulancia_id": 1,
    "patente": "AMB-001",
    "estado": "disponible",
    "stock": [
      {
        "presentacion_id": 1,
        "insumo_nombre": "Paracetamol",
        "insumo_cantidad": 500,
        "categoria": "Analgésico",
        "unidad_medida": "mg",
        "stock": 50
      }
    ]
  }
]
```

**Fix:** Use `flatMap` over ambulances, then map each `stock` item.
```ts
setInsumos(
  data.flatMap((ambulancia: any) =>
    (ambulancia.stock ?? []).map((item: any): Insumo => ({
      id: String(item.presentacion_id),
      nombre: item.insumo_nombre,
      categoria: item.categoria,
      cantidad: item.insumo_cantidad,
      unidadMedida: item.unidad_medida,
      ambulanciaPatente: ambulancia.patente,
      stock: item.stock,
    })),
  ),
);
```

---

## 4. `DespachosContext.tsx` — Ambulance mapping in both mappers

**Problem:** Both `mapearControl` and `mapearWorker` built `Ambulancia` objects using old field names (`id`, `modelo`, `estado_disponibilidad`).

**Fix for `mapearControl`** (backend only returns `ambulancia_id`, not a full object):
```ts
// BEFORE
ambulancia: d.ambulancia_id
  ? { id: String(d.ambulancia_id), patente: '', modelo: '', estado_disponibilidad: 'disponible' }
  : undefined,

// AFTER
ambulancia: d.ambulancia_id
  ? { ambulancia_id: Number(d.ambulancia_id), patente: '', estado: 'disponible' as const, stock: [] }
  : undefined,
```

**Fix for `mapearWorker`** (backend returns full ambulance object from `solicitud_usuario`):
```ts
// BEFORE
ambulancia: d.ambulancia
  ? { id: String(d.ambulancia.id), patente: d.ambulancia.patente ?? '', modelo: d.ambulancia.modelo ?? '', estado_disponibilidad: d.ambulancia.estado ?? 'disponible' }
  : undefined,

// AFTER
ambulancia: d.ambulancia
  ? { ambulancia_id: Number(d.ambulancia.id), patente: d.ambulancia.patente ?? '', estado: d.ambulancia.estado ?? 'disponible', stock: [] }
  : undefined,
```

> `mapearWorker` is used for the worker/medic route (`GET /ims/api/despachos/get/`).
> `mapearControl` is used for the control route (`GET /ims/api/despachos/getall/`).

---

## 5. `AtencionContext.tsx` — Patient name field

**Problem:** `fetchAtenciones` read `a.despacho?.paciente?.nombre` but backend returns `nombre_completo`.

**Fix:**
```ts
// BEFORE
paciente__nombre_completo: a.despacho?.paciente?.nombre ?? 'Sin paciente',

// AFTER
paciente__nombre_completo: a.despacho?.paciente?.nombre_completo ?? 'Sin paciente',
```

---

## 6. `RegistrarAtencion.tsx` — Wrong ambulance ID sent to backend

**Problem:** `despachoActivo.ambulancia?.id` → `id` no longer exists → `undefined ?? ''` → `Number('') = 0` → every attendance submission sent `ambulancia_id: 0`.

**Fix:**
```ts
// BEFORE
despachoActivo.ambulancia?.id ?? '',

// AFTER
String(despachoActivo.ambulancia?.ambulancia_id ?? ''),
```

---

## 7. Everywhere `Ambulancia` is rendered

All places that referenced `ambulancia.modelo` or `ambulancia.estado_disponibilidad` or `a.id` need the following corrections:

| File | Old | Fix |
|---|---|---|
| `components/admin/FormDespacho.tsx` | `.filter(a => a.estado_disponibilidad === 'disponible')` | `.filter(a => a.estado === 'disponible')` |
| `components/admin/FormDespacho.tsx` | `key={a.id} value={a.id}` | `key={a.ambulancia_id} value={String(a.ambulancia_id)}` |
| `components/admin/FormDespacho.tsx` | `` `${a.patente} — ${a.modelo}` `` | `a.patente` |
| `components/admin/DetalleDespacho.tsx` | `ambulancias.find(a => a.id === despacho.ambulancia?.id)` | `ambulancias.find(a => a.ambulancia_id === despacho.ambulancia?.ambulancia_id)` |
| `components/admin/DetalleDespacho.tsx` | `` `${ambulancia.modelo} — ${ambulancia.patente}` `` | `ambulancia.patente` |
| `app/(admin)/detalledespacho/[id].tsx` | `ambulancias.find(a => a.id === despacho?.ambulancia?.id)` | `ambulancias.find(a => a.ambulancia_id === despacho?.ambulancia?.ambulancia_id)` |
| `app/(admin)/detalledespacho/[id].tsx` | `` `${ambulancia.patente} — ${ambulancia.modelo}` `` | `ambulancia.patente` |
| `app/(admin)/Panel.tsx` | `ambulancias.filter(p => p.estado_disponibilidad === 'disponible')` | `ambulancias.filter(p => p.estado === 'disponible')` |
| `app/(user)/Despachos.tsx` | `` `${d.ambulancia.modelo} — ${d.ambulancia.patente}` `` | `d.ambulancia.patente` |

---

## 8. `PersonalContext.tsx` — Error propagation

**Problem:** `registrarWorker` swallowed errors and returned `null`, so the caller never saw the backend error message.

**Fix:** Remove try/catch, let the error propagate. Read response body on failure.
```ts
// BEFORE
const registrarWorker = async (data: NuevoWorker): Promise<WorkerCreado | null> => {
  try {
    const response = await fetchConSesion('/ims/api/personal/', { method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.json();
  } catch (e: any) {
    console.error('Error registrando worker:', e.message);
    return null;
  }
};

// AFTER
const registrarWorker = async (data: NuevoWorker): Promise<WorkerCreado | null> => {
  const response = await fetchConSesion('/ims/api/personal/', { method: 'POST', body: JSON.stringify(data) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error ?? `Error ${response.status}`);
  }
  return await response.json();
};
```

---

## Known Backend Bugs (not fixable on frontend)

| Location | Bug |
|---|---|
| `utils.py` | `import secrets` (stdlib) shadowed by `from backend_config.settings import secrets` → `generate_password()` crashes with `AttributeError` → 500 on personnel registration |
| `views.py` | `from .toolbox.Ambulancia_package import gets, move` overwrites `from .toolbox.Inventario_package import add, gets, update` → `/ims/api/inv/` calls the wrong `gets` |
| `views.py` `DespachoASolicitudUsuario` | `return Response({r}, ...)` — `{r}` is a Python set literal, raises `TypeError` at runtime. Should be `Response(r, ...)` |
| `AtencionContext.tsx` | `fetchAtencionDetalleLocal` and `modificarAtencion` call `/ims/api/atenciones/detalle/` and `/ims/api/atenciones/update/` — these endpoints do not exist |
| `AuthContext.tsx` | `verifyPassword` calls `/ims/api/verify-password/` — this endpoint does not exist |
