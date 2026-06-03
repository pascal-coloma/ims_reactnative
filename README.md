# IMS — Integrated Medical System

Mobile application for prehospital emergency management. Enables control operators to coordinate dispatches and field personnel to register medical attentions with electronic signature.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.76 + Expo Router 4 + TypeScript |
| State | React Context API + react-hook-form |
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL |
| Storage | AWS S3 (presigned URLs) |
| Authentication | Django sessions + TOTP (RFC 6238) |
| PDF | expo-print + expo-sharing |
| Signature | SHA-256 hash integrity |

---

## Architecture

### Role-based module separation

Expo Router file-based routing enforces role isolation at the structural level. Each role group has its own layout with independent provider trees — a role cannot navigate to another module because the route does not exist in its navigation context.

```
app/
  (auth)/         login, TOTP verification, password recovery
  (admin)/        control role — full dispatch and personnel management
  (user)/         medic, nurse, driver — dispatch view and attention registration
  index.tsx       entry point — redirects based on user state and role
```

### Authentication flow

1. `GET /ims/api/login/` — obtains CSRF cookie
2. `POST /ims/api/login/` — validates username + password + TOTP code
3. On success: `sessionid` and `csrftoken` persisted to `AsyncStorage` and `CookieManager`
4. `AuthContext` restores session on app launch; rehydrates cookies from `AsyncStorage` when the OS clears them from memory
5. `fetchConSesion` intercepts 401/403 responses, clears stored credentials, and triggers `setUser(null)` via a module-level callback — the router redirects to login automatically

Session duration: 3 days (Django `SESSION_COOKIE_AGE`).

### Request authentication

All authenticated requests go through `fetchConSesion`, which reads `sessionid` and `csrftoken` from `CookieManager` and attaches them as `Cookie` header and `X-CSRFToken` header respectively.

---

## Roles

| Role | Access |
|---|---|
| `control` | Full admin module: dispatch registration, personnel, ambulances, inventory, attentions |
| `medic` | User module: assigned dispatches, attention registration |
| `nurse` | User module: assigned dispatches, attention registration |
| `driver` | User module: assigned dispatches, attention registration |

---

## Key Flows

### Dispatch registration (control)

1. Patient lookup by RUT via `GET /ims/api/pacientes/?rut=XX`
2. If not found, create via `POST /ims/api/pacientes/`
3. Create dispatch via `POST /ims/api/despachos/add/`
4. Assign ambulance and group via `PATCH /ims/api/despachos/asignar/`

### Attention registration (field personnel)

On entering `registrar-atencion`, `useFocusEffect` selects the last active dispatch for the authenticated user. The form is pre-populated from the dispatch record via `fetchConSesion`.

Submitted payload includes:

- Patient data
- Vital signs (paginated, multiple controls supported)
- Pre-report (free text + patient status)
- Chronology (timestamps per dispatch phase + categorization)

Stored to AWS S3 with SHA-256 hash for document integrity.

### PDF generation

1. `GET /ims/api/atenciones/?id=N` returns an S3 presigned URL (expires on access)
2. Document JSON fetched directly from S3
3. HTML template rendered client-side with `expo-print`
4. Shared via `expo-sharing`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ims/api/login/` | Obtain CSRF token |
| POST | `/ims/api/login/` | Authenticate — username + password + totp\_code |
| GET | `/ims/api/personal/` | List personnel |
| POST | `/ims/api/personal/` | Register worker — returns totp\_uri and generated password |
| GET | `/ims/api/pacientes/` | List patients or search by `?rut=XX` |
| POST | `/ims/api/pacientes/` | Create patient |
| GET | `/ims/api/grupo/` | List groups |
| POST | `/ims/api/grupo/suscribir/` | Subscribe personnel to group |
| POST | `/ims/api/despachos/add/` | Create dispatch |
| PATCH | `/ims/api/despachos/asignar/` | Assign ambulance and group to dispatch |
| GET | `/ims/api/despachos/get/` | Active dispatches for authenticated worker |
| GET | `/ims/api/despachos/getall/` | All dispatches (control only) |
| GET | `/ims/api/ambulancias/` | List ambulances |
| GET | `/ims/api/atenciones/` | Attention summary or `?id=N` for S3 presigned URL |
| POST | `/ims/api/atenciones/add/` | Register attention |

Base URL: configured via `EXPO_PUBLIC_API_URL` environment variable (see `.env.example`)

---

## Project Structure

```
app/
  (auth)/               login, TOTP verification, password recovery
  (admin)/              control role screens (kebab-case filenames)
    AdminProviders.tsx  — provider tree composed via components/admin/AdminProviders
  (user)/               field personnel screens (kebab-case filenames)
  index.tsx             entry point — redirects based on user state and role
  _layout.tsx           root layout — exports ErrorBoundary, mounts AuthProvider

components/
  admin/
    AdminProviders.tsx  Composes all admin context providers in one place
    ...                 Admin-specific UI components
  user/                 Field personnel UI components
  AppHeader.tsx         Navigation header with safe area insets
  DashboardHeader.tsx   Dashboard header with avatar and drawers
  EstadoBadge.tsx       Reusable dispatch status badge

context/                All providers use useCallback + useMemo to stabilize references
  AuthContext.tsx        Session management, fetchConSesion, session expiry handler
  DespachosContext.tsx   Dispatch state and operations
  AtencionContext.tsx    Attention registration and retrieval
  PersonalContext.tsx    Personnel list and worker registration
  AmbulanciaContext.tsx  Ambulance list
  PacienteContext.tsx    Patient list and search
  InventoryContext.tsx   Medical supplies
  GrupoContext.tsx       Group management

data/
  constants/
    defaultValues.ts    react-hook-form default values
  mock/                 Static mock data (used when OFFLINE_MODE is true)
  types/
    index.ts            Shared TypeScript types

utils/
  pdf.ts                PDF generation from S3 document JSON
  format.ts             formatearRut, validarRut, formatearFecha, validarFecha,
                        formatearTelefono, formatearFechaHora, formatearHora
  labels.ts             traducirRol — role to display name mapping
  despacho.ts           ESTADO_COLOR — status to color mapping

styles/
  globalStyles.ts       Shared StyleSheet tokens
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Expo CLI
- Android Studio with emulator configured (API 33+)

### Environment

Copy `.env.example` to `.env` and set the API URL:

```bash
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL
```

### Install

```bash
npm install
```

### Run on emulator

```bash
npx expo run:android
```

### Build debug APK

```bash
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Android cleartext traffic

The backend runs over HTTP. Ensure `AndroidManifest.xml` includes:

```xml
<application android:usesCleartextTraffic="true" ...>
```

---

## Utilities

### RUT validation (Chilean)

`validarRut(rut: string): boolean` — implements modulo-11 algorithm. Accepts formatted (`12.345.678-9`) or raw (`123456789`) input.

`formatearRut(rut: string): string` — formats raw input as `XX.XXX.XXX-X` on change.

Validation triggers automatically when the input reaches 8+ digits — border color changes to green (valid) or red (invalid) without waiting for form submission.

---

## Pending

- `POST /ims/api/verify-password/` — credential validation endpoint before TOTP screen (frontend code scaffolded and commented in `LoginForm.tsx` and `AuthContext.tsx`)
- Dynamic group picker in `FormDespacho` — depends on `nombre_grupo` field in `GET /ims/api/grupo/`
- `InventoryContext` backend integration — currently uses mock data
