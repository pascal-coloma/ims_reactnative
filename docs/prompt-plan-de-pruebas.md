Escribe la documentación del plan de pruebas de este proyecto (ims_reactnative, app React Native/Expo) y entrégala como un .docx exportable a PDF.

## CONTEXTO DEL PROYECTO
- Stack de testing: Jest con preset `jest-expo` + `@testing-library/react-native`. Config en `jest.config.js` (raíz del repo).
- Los tests viven en `__tests__/`, organizados en `utils/`, `context/`, `app/` y `components/`.
- Patrón de mocking establecido: los contexts que hacen fetch usan `jest.mock('@/context/AuthContext', () => ({ fetchConSesion: jest.fn(), useAuth: jest.fn() }))`. Los layouts con guards de rol mockean `expo-router` (Redirect/Tabs) y `@expo/vector-icons`. Los componentes con formularios usan un "Harness" que envuelve el componente en `useForm()`/`FormProvider` real de `react-hook-form`.
- La suite se construyó en dos pasadas con priorización por riesgo, NO por cobertura total: Tier 1 = lógica de alto riesgo sin tests (auth guards, registros clínicos/operativos), Tier 2 = lógica real de menor riesgo (formularios, notificaciones), Tier 3 = deliberadamente excluido (sin ramas que puedan romperse, o glue de módulos nativos mejor verificado manualmente).

## QUÉ DEBES HACER PRIMERO (no asumas números, verifícalos)
1. Corre `npx jest --coverage --silent` en la raíz del repo y captura la tabla de cobertura real (% stmts/branch/funcs/lines por archivo).
2. Corre `npx jest --listTests` o `find __tests__ -name "*.test.*"` para confirmar el inventario exacto de archivos de test (debería haber 18 archivos, ~139 tests — verifica el número real, puede haber cambiado).
3. Lee cada archivo de test para extraer qué describe/it cubre, en vez de inventar descripciones.

## ESTRUCTURA DEL DOCUMENTO
1. Portada/Introducción: objetivo del plan de pruebas, alcance (app de gestión de despachos/ambulancias/inventario para servicio de emergencias), stack de testing.
2. Estrategia de priorización: explica el criterio de tiers por riesgo (no cobertura ciega) — qué hace que algo sea "Tier 1" (auth bypass, datos clínicos, dinero/stock) vs "Tier 3" (sin ramas, side-effects nativos).
3. Matriz de pruebas: una tabla por área (utils / contexts / layouts-routing / components), con columnas: archivo de test, qué unidad cubre, casos principales (éxito, error, edge case), tier asignado.
   - Contexts a documentar: AuthContext, DespachosContext, InventoryContext, AmbulanciaContext, AtencionContext, GrupoContext, PersonalContext, PacienteContext, NotificationContext.
   - Layouts/routing: `app/index.tsx`, `app/(admin)/_layout.tsx`, `app/(user)/_layout.tsx` (guards de rol).
   - Componentes: LoginForm, InsumosForm, ControlVitales, FormPaciente (user).
   - Utils: format, labels, api.
4. Cobertura actual: pega la tabla real obtenida en el paso 1, con interpretación breve (qué áreas quedaron fuertes vs débiles).
5. Exclusiones deliberadas (Tier 3) y su razón — documenta explícitamente que NO son huecos olvidados sino decisiones:
   - `utils/despacho.ts`: mapa de constantes, sin lógica.
   - `utils/pdf.ts`, `utils/firebaseApp.ts`, `utils/firebaseMessaging.ts`: side-effects de módulos nativos, mejor verificación manual/E2E que mock pesado.
   - Componentes puramente presentacionales (EstadoBadge, AppHeader, DashboardHeader, NotificationCard, DispatchCard, RecoverConfirm): sin ramas condicionales relevantes.
   - Tests de pantalla completa (las 27 rutas bajo `app/`): la lógica de negocio ya está cubierta a nivel de context/componente; duplicarla en tests de pantalla es alto costo, bajo valor incremental.
   - Variantes admin de FormPaciente/FormDespacho e InsumosForm avanzado: mismo molde ya validado en la variante user, retorno decreciente — candidatos a futuro si se prioriza.
6. Pendientes / próximos pasos: enumera qué quedaría en un Tier 2.5/3 futuro si se decide ampliar cobertura, sin comprometerte a hacerlo ahora.

## FORMATO Y ENTREGA
- Genera un archivo .docx real (no markdown disfrazado) con estilos de heading consistentes y la tabla de cobertura como tabla nativa de Word, no como texto plano.
- Usa la herramienta más simple disponible en el entorno: si `pandoc` está instalado, redacta el contenido en Markdown y conviértelo con `pandoc plan-de-pruebas.md -o plan-de-pruebas.docx`; si no, usa `python-docx`. Verifica primero qué hay disponible (`which pandoc`, `which libreoffice`, `python3 -c "import docx"`) en vez de asumir.
- Exporta también a PDF a partir del mismo .docx (p. ej. `libreoffice --headless --convert-to pdf plan-de-pruebas.docx`). Si no hay LibreOffice disponible, dilo explícitamente en vez de fallar en silencio o instalar dependencias nuevas sin preguntar.
- Guarda ambos archivos en `docs/` (créala si no existe) con nombre `plan-de-pruebas-ims.docx` / `.pdf`.
- No inventes números de cobertura ni nombres de test que no verificaste leyendo el repo.
