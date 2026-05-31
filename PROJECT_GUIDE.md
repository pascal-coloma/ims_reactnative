# ims_reactnative — Project Guide

A practical guide to the **imSystem** React Native / Expo frontend: a mobile app for emergency medical dispatch management.

---

## Table of Contents

1. [Big Picture](#1-big-picture)
2. [Project Structure](#2-project-structure)
3. [Authentication & Session Management](#3-authentication--session-management)
4. [Navigation Structure](#4-navigation-structure)
5. [Role-Based Access](#5-role-based-access)
6. [Screens Reference](#6-screens-reference)
7. [State Management — Context API](#7-state-management--context-api)
8. [API Client Layer](#8-api-client-layer)
9. [Form Handling](#9-form-handling)
10. [TypeScript Types](#10-typescript-types)
11. [Utilities](#11-utilities)
12. [Offline Mode](#12-offline-mode)
13. [Dependencies](#13-dependencies)
14. [What's Built vs. Incomplete](#14-whats-built-vs-incomplete)

---

## 1. Big Picture

imSystem mobile is the field-facing client for the emergency dispatch backend. It serves two distinct user populations:

- **Control operators** (`control` role): dispatch creators, team assigners, staff managers, inventory supervisors.
- **Field staff** (`medic`, `nurse`, `driver` roles): receive dispatch assignments, register full medical attendance records (atenciones), view their own history.

```
┌──────────────────────────────────────┐
│  ims_reactnative (Expo / RN)         │
│                                      │
│  /(auth)    → Login + TOTP           │
│  /(admin)   → Control dashboard      │
│  /(user)    → Field staff dashboard  │
└──────────────────┬───────────────────┘
                   │ HTTPS + session cookies
                   ▼
         https://956.duckdns.org
         (Django REST Framework)
```

The app uses **cookie-based session auth** backed by AsyncStorage for persistence across app restarts and backgrounding.

---

## 2. Project Structure

```
ims_reactnative/
├── app/                        ← Expo Router screens (file-based routing)
│   ├── _layout.tsx             ← Root layout; wraps tree with AuthProvider
│   ├── index.tsx               ← Entry point; redirects based on auth + role
│   ├── (auth)/                 ← Unauthenticated routes
│   │   ├── login.tsx           ← RUT + password form
│   │   ├── totp.tsx            ← 6-digit TOTP code entry
│   │   └── recuperacion.tsx    ← Password recovery (incomplete)
│   ├── (admin)/                ← Control-role routes
│   │   ├── _layout.tsx         ← Tab navigator + all context providers
│   │   ├── AdminDashboard.tsx
│   │   ├── Despachos.tsx
│   │   ├── Panel.tsx
│   │   ├── RegistrarDespacho.tsx
│   │   ├── RegistrarWorker.tsx
│   │   ├── ListaAtenciones.tsx
│   │   ├── ListaPersonal.tsx
│   │   ├── Inventario.tsx
│   │   └── detalledespacho/[id].tsx   ← Dynamic route
│   └── (user)/                 ← Field-staff routes
│       ├── _layout.tsx         ← Tab navigator + context providers
│       ├── UserDashboard.tsx
│       ├── Despachos.tsx
│       ├── RegistrarAtencion.tsx
│       ├── MisAtenciones.tsx
│       └── ModificarAtencion.tsx
│
├── components/                 ← Reusable UI components
│   ├── LoginForm.tsx
│   ├── DashboardHeader.tsx     ← Avatar, name, notification bell, settings
│   ├── AppHeader.tsx           ← Title + back button
│   ├── NotificationDrawer.tsx  ← Slide-in notifications panel
│   ├── SettingsDrawer.tsx      ← Logout + settings
│   ├── NotificationCard.tsx
│   ├── EstadoBadge.tsx         ← Status pill (recibido / activo / finalizado)
│   ├── RecoverConfirm.tsx
│   ├── admin/
│   │   ├── FormDespacho.tsx    ← Dispatch fields (addresses, ambulancia, grupo)
│   │   ├── FormPaciente.tsx    ← Patient fields for admin dispatch form
│   │   ├── ListaDespachos.tsx  ← Searchable, filterable dispatch list
│   │   ├── DetalleDespacho.tsx ← Clickable dispatch card
│   │   └── dashboard/
│   │       ├── Actions.tsx     ← Quick-action links
│   │       └── DispatchCard.tsx
│   └── user/
│       ├── FormPaciente.tsx    ← Patient fields in atencion form
│       ├── ControlVitales.tsx  ← Vital signs section (paginated)
│       ├── InsumosForm.tsx     ← Supply search + add
│       ├── PreInforme.tsx      ← Pre-report + patient state toggle
│       └── Cronologia.tsx      ← Timeline with time pickers
│
├── context/                    ← React Context (global state)
│   ├── AuthContext.tsx         ← Auth state, login, logout, fetchConSesion helper
│   ├── DespachosContext.tsx
│   ├── AtencionContext.tsx
│   ├── InventoryContext.tsx
│   ├── PacienteContext.tsx
│   ├── PersonalContext.tsx
│   └── AmbulanciaContext.tsx
│
├── data/
│   ├── types/types.ts          ← All TypeScript interfaces
│   └── constants/
│       ├── defaultValues.ts    ← Form defaults + OFFLINE_MODE flag
│       ├── mockDespachos.ts    ← Mock data for offline mode
│       ├── mockAmbulancia.ts   ← Mock ambulances + emergency categories
│       ├── mockPersonal.ts
│       ├── mockPaciente.ts
│       ├── mockInventario.ts
│       ├── mockNotificaciones.ts
│       └── generatePDF.ts      ← HTML → PDF generation from atencion data
│
├── utils/
│   ├── format.ts               ← RUT / date / phone formatting & validation
│   ├── labels.ts               ← Role name translation (e.g., 'medic' → 'Médico')
│   └── despacho.ts             ← Estado → color mapping
│
├── styles/
│   └── globalStyles.ts         ← Shared StyleSheet (container, button, etc.)
│
├── app.json                    ← Expo config (bundle ID, icons, splash)
├── eas.json                    ← EAS Build profiles
└── tsconfig.json
```

---

## 3. Authentication & Session Management

The app uses **Django session cookies** + **TOTP MFA**, mirroring the backend's two-factor login flow.

### Login flow

```
1. LoginForm.tsx
   └── User enters RUT + password
   └── Stores as pendingCredentials in AuthContext
   └── Navigates to /(auth)/totp

2. totp.tsx
   └── User enters 6-digit TOTP code
   └── Auto-submits when 6th digit entered
   └── Calls AuthContext.login(username, password, totpCode)

3. AuthContext.login()
   a. GET /ims/api/login/ → fetches CSRF token (set-cookie header)
   b. POST /ims/api/login/ { username, password, totp_code }
      → backend sets sessionid + csrftoken cookies
   c. Saves sessionid + csrftoken to AsyncStorage
   d. GET /ims/api/personal/ → finds user record by username
      → extracts first_name, last_name, id
   e. Builds User object, saves to AsyncStorage
   f. Returns { role, personalId }

4. totp.tsx routes:
   role === 'control'               → /(admin)/AdminDashboard
   role === 'medic'|'nurse'|'driver' → /(user)/UserDashboard
```

### Session persistence

| Trigger | Behavior |
|---|---|
| App cold start | Reads `user` + `sessionid` from AsyncStorage; restores cookies to CookieManager |
| App returns to foreground | `AppState` listener re-injects cookies if OS cleared them |
| 401/403 response | `fetchConSesion` clears storage + cookies, triggers logout via `_onSessionExpired` handler |
| Explicit logout | Clears AsyncStorage + CookieManager, sets `user = null` |

Sessions last 3 days (set by backend `SESSION_COOKIE_AGE`).

### `fetchConSesion` — authenticated request helper

All API calls go through this function exported from `AuthContext.tsx`:

```typescript
fetchConSesion(url: string, options?: RequestInit): Promise<Response>
```

It automatically:
- Reads `sessionid` + `csrftoken` from CookieManager
- Sets `Cookie`, `X-CSRFToken`, `Content-Type`, and `Origin` headers
- Persists any `set-cookie` headers from the response
- Triggers session expiry handler on 401/403

### User object stored in state and AsyncStorage

```typescript
type User = {
  username: string;       // RUT without dots (e.g., "12345678")
  role: Role;             // 'control' | 'medic' | 'nurse' | 'driver'
  personalId: string;     // Personal.id from /ims/api/personal/
  firstName: string;
  lastName: string;
}
```

---

## 4. Navigation Structure

The app uses **Expo Router** (file-based routing). Route groups with parentheses are layout groups, not URL segments.

```
/index                          ← Redirects based on user.role

/(auth)/login                   ← Login form
/(auth)/totp                    ← TOTP verification
/(auth)/recuperacion            ← Password recovery

/(admin)/AdminDashboard         ← Tab 1: Home
/(admin)/Despachos              ← Tab 2: Dispatch list
/(admin)/Panel                  ← Tab 3: Quick actions
/(admin)/RegistrarDespacho      ← Pushed from Actions
/(admin)/RegistrarWorker        ← Pushed from Actions
/(admin)/ListaAtenciones        ← Pushed from Actions
/(admin)/ListaPersonal          ← Pushed from Actions
/(admin)/Inventario             ← Pushed from Actions
/(admin)/detalledespacho/[id]   ← Dynamic: dispatch detail

/(user)/UserDashboard           ← Tab 1: Home
/(user)/Despachos               ← Tab 2: My dispatches
/(user)/RegistrarAtencion       ← Tab 3: Register attendance
/(user)/MisAtenciones           ← Pushed from Dashboard / tab
/(user)/ModificarAtencion       ← Pushed from MisAtenciones (param: id)
```

**Tab bar accent color:** `#E53935` (red), inactive: `#999`.

---

## 5. Role-Based Access

Route groups enforce role segregation at the navigation level:

| Route Group | Allowed Roles | Enforced By |
|---|---|---|
| `/(auth)/` | Unauthenticated | `index.tsx` redirect |
| `/(admin)/` | `control` | `index.tsx` redirect + `_layout.tsx` providers |
| `/(user)/` | `medic`, `nurse`, `driver` | `index.tsx` redirect + `_layout.tsx` providers |

`index.tsx` reads `user.role` and calls `router.replace()` to the correct group. If `user` is null, it redirects to login.

Within screens:
- **`ListaDespachos` (admin)** fetches all dispatches via `getall`; **`Despachos` (user)** fetches only the user's assigned dispatches via `get`.
- **`RegistrarAtencion`** is only accessible to `medic`/`nurse` (driver can navigate there but has no functional dispatch to register against).
- **`Inventario` (admin)** allows editing; **`InsumosForm` (user)** is read-only for supply selection.

---

## 6. Screens Reference

### Authentication

| Screen | File | Purpose |
|---|---|---|
| Login | `app/(auth)/login.tsx` | RUT + password entry; routes to TOTP |
| TOTP | `app/(auth)/totp.tsx` | 6-digit code; auto-submits on 6th digit |
| Recuperación | `app/(auth)/recuperacion.tsx` | Password recovery — **incomplete** |

### Admin (control role)

| Screen | File | Purpose |
|---|---|---|
| Admin Dashboard | `(admin)/AdminDashboard.tsx` | Home with active dispatch card + quick actions |
| Panel | `(admin)/Panel.tsx` | Stats (despachos, ambulancias, personal) + navigation links |
| Despachos | `(admin)/Despachos.tsx` | All dispatches, searchable + filterable by estado |
| Detalle Despacho | `(admin)/detalledespacho/[id].tsx` | Single dispatch: addresses, ambulance, team members |
| Registrar Despacho | `(admin)/RegistrarDespacho.tsx` | Full form: patient data + dispatch details; creates patient if not found, then creates and assigns dispatch |
| Registrar Worker | `(admin)/RegistrarWorker.tsx` | Creates a new staff member; displays temporary password + QR for TOTP setup |
| Lista Atenciones | `(admin)/ListaAtenciones.tsx` | All care records; "Generar PDF" fetches S3 URL and generates local PDF |
| Lista Personal | `(admin)/ListaPersonal.tsx` | All staff, color-coded by role, searchable |
| Inventario | `(admin)/Inventario.tsx` | Supplies per ambulance; edit stock; filter by ambulancia |

### User (medic / nurse / driver)

| Screen | File | Purpose |
|---|---|---|
| User Dashboard | `(user)/UserDashboard.tsx` | Home: active dispatch card + quick links |
| Despachos | `(user)/Despachos.tsx` | Dispatches assigned to the current user |
| Registrar Atención | `(user)/RegistrarAtencion.tsx` | Full attendance form (5 sections); submits to backend for cryptographic signing |
| Mis Atenciones | `(user)/MisAtenciones.tsx` | User's own care records; links to edit |
| Modificar Atención | `(user)/ModificarAtencion.tsx` | Edit vitals, pre-report, and timeline for an existing atencion |

---

## 7. State Management — Context API

All state is managed through React Context. No Redux or Zustand. Contexts are stacked per route group in `_layout.tsx`.

### Provider hierarchy

**`/(admin)/_layout.tsx`:**
```
AuthProvider (root)
  └─ DespachosProvider
      └─ PersonalProvider
          └─ PacienteProvider
              └─ AtencionProvider
                  └─ InventarioProvider
                      └─ AmbulanciaProvider
```

**`/(user)/_layout.tsx`:**
```
AuthProvider (root)
  └─ InventarioProvider
      └─ DespachosProvider
          └─ AtencionProvider
```

### Context reference

| Context | Key State | Key Methods |
|---|---|---|
| `AuthContext` | `user`, `loading`, `pendingCredentials` | `login()`, `logout()`, `verifyPassword()` |
| `DespachosContext` | `despachos[]`, `despachoActivo` | `fetchDespachos()`, `agregarDespacho()`, `seleccionarDespacho()`, `despachosPorPersonal()`, `recargar()` |
| `AtencionContext` | `atenciones[]`, `resumenAtenciones[]`, `loading`, `error` | `agregarAtencion()`, `fetchAtenciones()`, `fetchAtencionDetalle()`, `fetchAtencionDetalleLocal()`, `modificarAtencion()`, `buscarPorDespacho()` |
| `InventoryContext` | `insumos[]`, `loading`, `error` | `buscarInsumo()`, `agregarInsumo()`, `editarInsumo()`, `eliminarInsumo()`, `recargar()` |
| `PacienteContext` | `pacientes[]` | `buscarPaciente()`, `agregarPaciente()` |
| `PersonalContext` | `personal[]` | `registrarWorker()`, `actualizarDisponibilidad()` |
| `AmbulanciaContext` | `ambulancias[]` | Fetch on mount only |
### Data-mapping note

Both `DespachosContext` and `AtencionContext` translate snake_case API responses to camelCase local types. There are **two different mappers** in `DespachosContext`:

- `mapearControl`: for `getall` response (includes `ambulancia_id` but not full ambulance details)
- `mapearWorker`: for `get` response (includes full nested ambulance object)

---

## 8. API Client Layer

**Base URL:** `https://956.duckdns.org`

All calls go through `fetchConSesion` (see §3). Payloads are `application/json`.

### Complete endpoint list called by the app


| Method | URL | Called From | Purpose |
|---|---|---|---|
| GET | `/ims/api/login/` | `AuthContext` | Fetch CSRF token |
| POST | `/ims/api/login/` | `AuthContext.login` | Authenticate + get session |
| POST | `/ims/api/verify-password/` | `AuthContext.verifyPassword` | Pre-validate credentials (currently unused — commented out) |
| GET | `/ims/api/personal/` | `AuthContext.login` | Resolve user name + ID after login |
| POST | `/ims/api/personal/` | `PersonalContext` | Create new staff member |
| GET | `/ims/api/pacientes/?rut=` | `DespachosContext` | Look up patient by RUT |
| POST | `/ims/api/pacientes/` | `DespachosContext` | Create new patient |
| GET | `/ims/api/despachos/getall/` | `DespachosContext` (control) | List all dispatches |
| GET | `/ims/api/despachos/get/` | `DespachosContext` (user) | List user's dispatches |
| POST | `/ims/api/despachos/add/` | `DespachosContext` | Create dispatch |
| PATCH | `/ims/api/despachos/asignar/` | `DespachosContext` | Assign ambulance + group |
| GET | `/ims/api/ambulancias/` | `AmbulanciaContext` | List ambulances |
| GET | `/ims/api/atenciones/` | `AtencionContext` | List atencion summaries |
| GET | `/ims/api/atenciones/?id=` | `AtencionContext.fetchAtencionDetalle` | Get S3 presigned URL for a document |
| GET | `/ims/api/atenciones/detalle/?id=` | `AtencionContext.fetchAtencionDetalleLocal` | Fetch atencion data for edit form prefill |
| POST | `/ims/api/atenciones/add/` | `AtencionContext.agregarAtencion` | Register new attendance |
| PATCH | `/ims/api/atenciones/update/` | `AtencionContext.modificarAtencion` | Update atencion (vitals/pre-report/cronología) |
| GET | `/ims/api/inv/get/` | `InventoryContext` | List supplies per ambulance |
| GET | `/ims/api/grupo/` | `DespachosContext` / forms | List teams for dispatch assignment |

### `agregarAtencion` payload shape

```typescript
{
  despacho: {
    despacho_id: number,
    ambulancia_id: number,
    hora_salida: string,        // ISO timestamp of form submission
    hora_llegada: string,       // ISO timestamp derived from cronologia.llegadaQTH1
  },
  signos_vitales: [{
    presion_sistolica, presion_diastolica, frecuencia_cardiaca,
    saturacion_oxigeno, temperatura, fr, fio2, hgt, gcs, eva,
    hora: string               // "HHMM" format
  }],
  preinforme: { pre_informe, motivo_llamado, estado_paciente },
  cronologia: {
    hora_llamada, despacho_movil, llegada_qth1, salida_qth1,
    llegada_qth2, salida_qth2, categoria       // all "HHMM" strings
  },
  insumos_utilizados: [{
    insumo_id: string,
    nombre: string,
    cantidad: number,
    unidad: string
  }]
}
```

---

## 9. Form Handling

All forms use **react-hook-form** with `Controller` for controlled inputs.

### Admin: `RegistrarDespacho`

Form type: `FormCompleta`. Sections:

- **FormPaciente**: `primerNombre`, `segundoNombre?`, `apellidoPaterno`, `apellidoMaterno`, `rut`, `fechaNacimiento`, `telefono?`, `condicionPaciente`, `comuna?`
- **FormDespacho**: `direccionOrigen`, `direccionDestino`, `descripcionLlamado`, `grupoAsignado` (Picker), `unidad` (Picker — ambulancias filtered to `disponible`)

### User: `RegistrarAtencion`

Form type: `FormUsuario = CamposPaciente & { controlSignos[], preInforme, cronologia, insumosUtilizados[] }`. Sections rendered as components:

| Component | Fields |
|---|---|
| `FormPaciente` | Patient identification fields (pre-filled from `despachoActivo`) |
| `ControlVitales` | PAS, PAD, PAM (computed), FC, FR, SatO2, FIO2, temp, HGT, GCS, EVA per time entry |
| `InsumosForm` | Search box → add from inventory list |
| `PreInformeForm` | Free text + `motivoLlamado` + `estadoPaciente` toggle (estable/inestable) |
| `Cronologia` | 6 time pickers (HHMM) + `categoria` dropdown (C1–C5) |

### Validation utilities (`utils/format.ts`)

| Function | Purpose |
|---|---|
| `formatearRut(rut)` | Returns `12.345.678-9` display format |
| `validarRut(rut)` | Verifies Chilean check digit algorithm |
| `formatearFecha(text)` | Auto-inserts `-` separators for DD-MM-YYYY input |
| `validarFecha(fecha)` | Validates date range + leap year correctness |
| `formatearTelefono(text)` | Ensures `+569XXXXXXXX` format |

**Vital sign ranges validated in `ControlVitales`:**
- GCS: 3–15
- EVA: 0–10
- Temperatura: 30–45 °C
- PAM auto-calculated: `(PAD * 2 + PAS) / 3`

---

## 10. TypeScript Types

All types are in `data/types/types.ts`.

```typescript
type Role = 'control' | 'medic' | 'nurse' | 'driver' | null;

type Insumo = {
  id: string; nombre: string; categoria: string; cantidad: number;
  unidadMedida: string; ambulanciaPatente: string; stock: number;
};

type InsumoUtilizado = { insumoId: string; nombre: string; cantidad: number; unidad: string; };

type SignosVitales = {
  hora: string;    // "HHMM"
  pas: number;     // presion_sistolica
  pad: number;     // presion_diastolica
  pam: number;     // computed: (pad*2 + pas) / 3
  fc: number;      // frecuencia_cardiaca
  fr: number;
  satO2: number;   // saturacion_oxigeno
  fio2: number;
  temperatura: number;
  hgt: number;
  gcs: number;
  eva: number;
};

type PreInforme = { preInforme: string; motivoLlamado: string; estadoPaciente: string; };
type Cronologia = {
  horaLlamada: string; despachoMovil: string;
  llegadaQTH1: string; salidaQTH1: string;
  llegadaQTH2: string; salidaQTH2: string;
  categoria: string;
};

type CamposPaciente = {
  primerNombre: string; segundoNombre?: string;
  apellidoPaterno: string; apellidoMaterno: string;
  rut: string; fechaNacimiento: string;
  telefono?: string; condicionPaciente: string; comuna?: string;
  direccionOrigen: string; direccionDestino?: string;
};

type FormCompleta = CamposPaciente & { descripcionLlamado: string; grupoAsignado: string; unidad: string; };
type FormUsuario = CamposPaciente & { controlSignos: SignosVitales[]; preInforme: PreInforme; cronologia: Cronologia; insumosUtilizados: InsumoUtilizado[]; };
type Atencion = { id: string; despachoId: string; fechaRegistro: string; paciente: CamposPaciente; controlSignos: SignosVitales[]; preInforme: PreInforme; cronologia: Cronologia; insumosUtilizados: InsumoUtilizado[]; };

type NuevoWorker = { first_name: string; last_name: string; rut: string; rol_id: number; };
type WorkerCreado = { totp_uri: string; password: string; usuario_id: number; };
type Miembro = { nombre: string; rut: string; rol: string; };
type Grupo = { grupo_id: number; grupo_nombre: string; miembros: Miembro[]; };
```

---

## 11. Utilities

**`utils/format.ts`** — input formatting and validation for Chilean ID (RUT), dates, and phone numbers.

**`utils/labels.ts`** — maps backend role keys to display strings:
- `'control'` → `'Control'`
- `'medic'` → `'Médico'`
- `'nurse'` → `'TENS'`
- `'driver'` → `'Chofer'`

**`utils/despacho.ts`** — maps dispatch `estado` values to UI colors:
- `'recibido'` → orange
- `'activo'` (= `'asignado'` remapped) → blue
- `'finalizado'` → green
- `'cancelado'` → red

**`data/constants/generatePDF.ts`** — builds an HTML string from a fetched atencion document and uses `expo-print` + `expo-sharing` to generate and share a PDF.

---

## 12. Offline Mode

A `OFFLINE_MODE` boolean flag in `data/constants/defaultValues.ts` (currently `false`) switches the app to use mock data instead of API calls.

When `true`:
- `DespachosContext` returns `mockDespachos`
- `AtencionContext.agregarAtencion` only updates local state
- Mock files provide sample patients, ambulances, personnel, notifications

This is a development/demo convenience feature, not production-ready (no sync, no persistence).

---

## 13. Dependencies
Key packages from `package.json`:

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.34 | Managed React Native runtime |
| `expo-router` | ~6.0.23 | File-based navigation |
| `react` | 19.1.0 | |
| `react-native` | 0.81.5 | |
| `react-hook-form` | ^7.72.1 | Form state + validation |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Tab bar navigator |
| `@react-native-async-storage/async-storage` | 2.2.0 | Session persistence |
| `@react-native-cookies/cookies` | ^6.2.1 | CSRF + session cookie management |
| `@react-native-community/datetimepicker` | 8.4.4 | Time pickers in Cronologia form |
| `@react-native-picker/picker` | 2.11.1 | Dropdowns (ambulancia, grupo, categoria) |
| `react-native-qrcode-svg` | ^6.3.21 | TOTP setup QR code in RegistrarWorker |
| `expo-print` | ~15.0.8 | HTML → PDF generation |
| `expo-sharing` | ~14.0.8 | Share PDF |
| `@dr.pogodin/react-native-fs` | ^2.38.2 | File system access |
| `@expo/vector-icons` | ^15.0.3 | MaterialIcons |
| `jest` + `@testing-library/react-native` | — | Unit testing |

---

## 14. What's Built vs. Incomplete

### Fully working

- Two-step login (RUT/password → TOTP → session cookie)
- Role-based routing and UI segregation
- Create dispatch with patient lookup/creation + team assignment (control)
- Dispatch list with filters + detail view (control)
- Register new staff member with TOTP QR display (control)
- List staff by role (control)
- View all care records + PDF export (control)
- User dispatch view (medic/nurse)
- Full attendance form: vitals, supplies, pre-report, timeline (medic/nurse)
- Session persistence across app restarts + foreground/background transitions

### Incomplete or broken

| Feature | Status | Notes |
|---|---|---|
| Password pre-validation on login | Commented out | `verifyPassword` call removed from `LoginForm.tsx` — wrong password only fails at TOTP step |
| Password recovery (`recuperacion.tsx`) | Minimal shell | No backend endpoint to support it yet |
| Notifications (`NotificationDrawer`) | Mock data only | Backend has `Notificacion` model but no API endpoint |
| `ModificarAtencion` | May be broken | Calls `PATCH /ims/api/atenciones/update/` which may not exist in backend |
| Inventory write-back | Local state only | `editarInsumo`/`eliminarInsumo` do not call any API |
| Group management UI | None | Backend has add/remove member endpoints; no frontend screens |
| Ambulance detail in admin dispatch mapping | Partial | `mapearControl` sets `patente: ''` and `modelo: ''` because `getall` only returns `ambulancia_id` |
| Device token registration | None | Backend has `DeviceToken` model; app never registers push tokens |
| Audit log | None | Backend model exists; no frontend exposure |
| Driver role | Navigable | Driver reaches `/(user)/` screens but has no functional flows (can't register atenciones) |


// revisar versiones de dependencias, actualizar de ser necesario
// Agregar pantallas para el control de los grupos.
// Llamar a las APIs para control del inventario.
// Ingreso de temperatura deberia permitir ingresar 2 enteros 1 decimal
// Restringir los campos de input para limitar el ingreso de numeros dentro del rango (ultimos fields de la atencion)
// pasar motivo de llamado a formulario de registro de despacho
// Cronologia pasaría a ser componente de la ruta driver para añadir funcionalidad a su perfil.
// horas deben registrarse en UTC, aunque, cual es el formato de hora del servidor?
// Podria unirse el fetch de csrf dentro del login?
// deberia montarse al navegar a despacho, para verificar disponibilidad al momento de cargar la pantalla de registro (ambulancia context)
// será mejor usar snake_case en la app en vez de camelcase para evitar la traducción y ahorrar memoria?
