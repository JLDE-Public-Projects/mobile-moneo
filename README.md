# Moneo

Aplicación móvil de finanzas personales, por invitación. Registra ingresos y egresos, organiza tus movimientos por categorías y cuentas, controla presupuestos y pagos recurrentes — todo con almacenamiento local en el dispositivo.

Construida con **React Native + Expo**, en TypeScript, con foco en una arquitectura desacoplada, fácil de mantener y escalar.

## Características

- **Autenticación local**: registro por código de invitación e inicio de sesión. Las claves se guardan con hash + sal (nunca en texto plano).
- **Resumen mensual**: balance del mes (ingresos − egresos) y últimos movimientos.
- **Movimientos**: lista con búsqueda y filtro (Todos / Egresos / Ingresos).
- **Nuevo movimiento**: modal con teclado numérico propio y selección de tipo, categoría y cuenta.
- **Gastos**: total del mes, barra apilada y desglose por categoría con su porcentaje; detalle por categoría (gastado vs presupuesto).
- **Cuentas**: patrimonio neto y administración de cuentas (banco, efectivo, crédito).
- **Categorías**: gestión de categorías de egreso e ingreso, con color y presupuesto.
- **Presupuesto**: límite mensual por categoría, ajustable, con alerta al superarlo.
- **Pagos recurrentes**: suscripciones y pagos fijos, con estado "por pagar" / "pagadas este mes" y la acción de registrarlos como movimiento.
- **Historial**: balance por mes (meses cerrados + mes en curso en vivo).
- **Perfil**: editar nombre y usuario, cambiar clave y compartir el código de invitación.
- **Ajustes**: moneda (COP / USD / EUR), privacidad y más.
- **UX**: splash animado con anillo de progreso, barra de pestañas flotante y micro-animaciones.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | React Native 0.86 + Expo SDK 57 |
| Lenguaje | TypeScript |
| Estado del servidor | TanStack Query (React Query) |
| Estado global | Zustand |
| Almacenamiento | SQLite local (`expo-sqlite`) con migraciones versionadas |
| Gráficos / íconos | `react-native-svg` |
| Efectos | `expo-blur`, `react-native-safe-area-context` |
| Tipografía | Sora (`@expo-google-fonts/sora`) |

## Arquitectura

El proyecto separa responsabilidades en capas para poder acoplar y desacoplar partes sin tocar el resto:

- **Patrón Repository**: cada dominio (auth, categorías, cuentas, movimientos, recurrentes) define una interfaz de repositorio. La implementación concreta (hoy SQLite local) se inyecta desde un único punto — el contenedor de dependencias en [`src/services/container.ts`](src/services/container.ts). Cambiar a una API externa es cambiar una línea, sin tocar la UI.
- **TanStack Query** gestiona el estado del servidor (peticiones, caché, invalidación). Al crear/editar datos, las pantallas se refrescan solas.
- **Zustand** guarda el estado global de UI (sesión, preferencias como la moneda).
- **Container / Presentacional**: la lógica de formularios vive en hooks (`src/hooks`), las pantallas quedan como render puro.
- **Diseño atómico**: componentes en `atoms` → `molecules` → `organisms`, reutilizables (`ListRow`, `SegmentedControl`, `BottomSheet`, `SelectionSheet`, etc.).
- **Navegación** propia y ligera (sin librería externa): un navegador con pestañas + pantallas de detalle superpuestas.

### Estructura de carpetas

```
src/
  components/
    atoms/         # Button, Toggle, BackLink, IconButton, SectionLabel, FadeInUp...
    molecules/     # ListRow, Card, InputRow, SearchBar, SegmentedControl,
                   # TransactionRow, AccountRow, CategoryRow, BudgetRow, NumericKeypad...
    organisms/     # FloatingTabBar, BottomSheet, SelectionSheet, AnimatedSplash,
                   # AddTransactionModal, NewCategorySheet, NewAccountSheet, NewRecurringSheet
    icons/         # Íconos SVG (Home, Movements, Expenses, Accounts, Settings, Plus...)
    layout/        # Screen (áreas seguras)
  config/          # currencies, palette, history
  hooks/           # useLoginForm, useRegisterForm
  navigation/      # MainNavigator
  screens/
    auth/          # AuthFlow, LoginScreen, RegisterScreen
    main/          # Home, Movements, Expenses, Accounts, CategoryDetail, History, Recurrings
    settings/      # Settings, Categories, Budget, Profile
  services/
    auth/          # types, repository, queries, security (hash), repositories/sqlite
    categories/
    accounts/
    transactions/
    recurrings/
    db/            # database.ts (apertura + migraciones)
    react-query/   # QueryProvider, queryClient
    container.ts   # inyección de repositorios
  store/           # authStore, settingsStore (Zustand)
  theme/           # colors, spacing, typography, layout
  utils/           # validation, date
```

## Empezar

Requisitos: Node, `npm`, Xcode (iOS) o Android Studio.

```bash
npm install
npm start
```

La app usa módulos nativos (SQLite, SVG, blur, fuentes), por lo que necesita un **development build** (no funciona en Expo Go estándar).

### iOS (simulador)

```bash
npm run ios
```

### iPhone físico (por USB)

Requiere Xcode con tu Apple ID configurado. Conecta el iPhone y:

```bash
npm run ios:device
```

La primera vez debes confiar el perfil de desarrollador en el iPhone: **Ajustes → General → VPN y gestión de dispositivos → confiar**.

### Android

```bash
npm run android
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Metro (development client) |
| `npm run ios` | Compila y corre en el simulador iOS |
| `npm run ios:device` | Compila e instala en un iPhone conectado por USB |
| `npm run android` | Compila y corre en Android |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |

## Base de datos

SQLite local con **migraciones versionadas** (`PRAGMA user_version`) en [`src/services/db/database.ts`](src/services/db/database.ts). El esquema evoluciona por pasos (usuarios, categorías, cuentas, movimientos, presupuesto, recurrentes, enlaces) y siembra datos de ejemplo la primera vez. Al migrar el almacenamiento a una API, se sustituyen los repositorios SQLite conservando las mismas interfaces.

## Notas

- El diseño de referencia se mantiene en un proyecto de Claude Design; la app lo sigue de cerca y, donde aporta, mejora la experiencia.
- El código y los identificadores están en inglés; los comentarios, en español.
- Estado del proyecto: en desarrollo, construido pantalla por pantalla.
