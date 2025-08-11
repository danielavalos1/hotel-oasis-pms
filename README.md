# Hotel Oasis PMS 🏨

Sistema de gestión hotelera integral desarrollado con **Next.js 15**, **React 19**, **TypeScript**, **Prisma ORM** y **PostgreSQL**. Un PMS (Property Management System) moderno y completo para la administración eficiente de hoteles.

## 🚀 Características Principales

- **Sistema de Reservas Completo**: Gestión de reservas, check-in/check-out, calendario de disponibilidad
- **Gestión de Huéspedes**: Base de datos de clientes, historial de reservas, información de contacto
- **Administración de Habitaciones**: Control de inventario, tipos de habitación, amenidades, estados
- **Gestión de Personal**: Administración de empleados, departamentos, horarios, asistencias
- **Dashboard Interactivo**: Reportes en tiempo real, estadísticas, métricas de ocupación
- **Sistema de Autenticación**: Control de acceso basado en roles (SuperAdmin, Admin, Recepcionista, etc.)
- **API RESTful**: Endpoints completos para integración con sistemas externos
- **Interfaz Responsiva**: Diseño moderno con Tailwind CSS y componentes Radix UI

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.1.5** con App Router
- **React 19** con TypeScript
- **Tailwind CSS 3.4.17** para estilos
- **Radix UI** para componentes accesibles
- **React Hook Form + Zod** para manejo de formularios
- **Lucide React** para iconografía
- **next-themes** para modo claro/oscuro

### Backend
- **Next.js API Routes** para endpoints RESTful
- **Prisma ORM 6.6.0** para acceso a base de datos
- **PostgreSQL** como base de datos principal
- **NextAuth.js** para autenticación
- **bcryptjs** para hash de contraseñas
- **Zod** para validación de esquemas

### DevOps & Tooling
- **TypeScript** para tipado estático
- **ESLint** para linting
- **Prisma** para migraciones y seeding
- **tsx** para ejecución de scripts TypeScript

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18.0 o superior)
- **pnpm** (recomendado) o npm/yarn
- **PostgreSQL** (versión 12 o superior)
- **Git**

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone git@github.com:danielavalos1/hotel-oasis-pms.git
cd hotel-oasis-pms
```

### 2. Instalar Dependencias

```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install

# O usando yarn
yarn install
```

### 3. Configuración de Base de Datos

#### 3.1 Opciones de Base de Datos

Tienes varias opciones para configurar PostgreSQL:

##### Opción A: PostgreSQL Local
- Instala PostgreSQL en tu máquina
- **No necesitas crear la base de datos manualmente**, Prisma la creará automáticamente

##### Opción B: Servicios Cloud (Recomendado para principiantes)
- **Supabase**: Gratis, fácil configuración, proporciona URL directa
- **Railway**: Fácil de usar, tier gratuito disponible  
- **Neon**: Serveless PostgreSQL, tier gratuito generoso
- **Vercel Postgres**: Si planeas desplegar en Vercel
- **Heroku Postgres**: Addon gratuito disponible, ideal para producción

#### 3.2 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y configura las variables:

```bash
cp .env.example .env.local
# O simplemente crea el archivo .env
```

Edita el archivo `.env` con tu configuración:

```env
# Base de datos
# Para DESARROLLO LOCAL (usa PostgreSQL local)
DATABASE_URL="postgresql://postgres:tucontraseña@localhost:5432/hoteloasis?schema=public"

# Para PRODUCCIÓN - Servicios cloud (Supabase, Railway, Neon, etc.)
# DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database?schema=public"

# Para PRODUCCIÓN - Heroku Postgres (se configura automáticamente en Heroku)
# DATABASE_URL="postgres://usuario:contraseña@host:puerto/database"

# Autenticación NextAuth
NEXTAUTH_SECRET="tu_secreto_super_seguro_aqui"
NEXTAUTH_URL="http://localhost:3000"

# API Keys para sistemas externos (opcional)
ALLOWED_API_KEYS="key1,key2,key3"

# Configuración SMTP para emails (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu_email@gmail.com"
SMTP_PASSWORD="tu_contraseña_de_aplicacion"
LOGO_URL="https://tu-dominio.com/logo.png"

# Origenes permitidos para CORS (opcional)
ALLOWED_ORIGINS="http://localhost:3000,https://tu-dominio.com"

# API Key pública para el frontend
NEXT_PUBLIC_API_KEY="key1"
```

### 4. Configuración de Prisma

#### 4.1 Generar Cliente de Prisma

```bash
pnpm db:generate
```

#### 4.2 Ejecutar Migraciones

```bash
pnpm db:migrate
```

**¿Qué hace este comando?**
- ✅ Crea automáticamente la base de datos si no existe
- ✅ Ejecuta todas las migraciones para crear las tablas
- ✅ Actualiza el esquema según el archivo `prisma/schema.prisma`

#### 4.3 Poblar Base de Datos (Seeding)

```bash
pnpm db:seed
```

Este comando creará:
- **Usuarios de prueba** con diferentes roles
- **Habitaciones** con diferentes tipos y amenidades
- **Amenidades** predefinidas del hotel

#### 4.4 Configuración para Producción (Heroku)

Si vas a **desplegar en producción usando Heroku**, sigue estos pasos adicionales:

> **⚠️ Importante**: Estos comandos son solo para **producción/deployment**. Para desarrollo local, usa los comandos estándar de Prisma (`pnpm db:migrate`, `pnpm db:seed`).

##### 1. Obtener la URL de la Base de Datos

```bash
# Si ya tienes la app de Heroku configurada
heroku config:get DATABASE_URL -a tu-app-name

# O desde el dashboard de Heroku, copia la DATABASE_URL
```

##### 2. Ejecutar Migraciones en Heroku (Producción)

```bash
# Opción A: Desde Heroku CLI (Recomendado)
heroku run pnpm db:deploy -a tu-app-name

# Opción B: Desde tu máquina local hacia Heroku
DATABASE_URL="tu_heroku_database_url" pnpm db:deploy
```

##### 3. Poblar Base de Datos en Heroku (Producción)

```bash
# Opción A: Desde Heroku CLI (Recomendado)
heroku run pnpm db:seed -a tu-app-name

# Opción B: Desde tu máquina local hacia Heroku
DATABASE_URL="tu_heroku_database_url" pnpm db:seed
```

**⚠️ Notas importantes para Heroku:**
- Estos comandos son **SOLO para producción/deployment en Heroku**
- Para desarrollo local, siempre usa `pnpm db:migrate` y `pnpm db:seed`
- Usa `pnpm db:deploy` en lugar de `pnpm db:migrate` para producción
- La URL de Heroku puede cambiar ocasionalmente, verifica en el dashboard
- El comando `db:deploy` no creará archivos de migración nuevos, solo aplica los existentes

### 5. Ejecutar el Proyecto

#### Flujo de Trabajo Recomendado

**Para Desarrollo Local:**
```bash
# 1. Configurar base de datos local
pnpm db:generate    # Generar cliente
pnpm db:migrate     # Crear/actualizar tablas
pnpm db:seed        # Poblar con datos de prueba

# 2. Iniciar desarrollo
pnpm dev           # Servidor en http://localhost:3000
```

**Para Deployment en Heroku:**
```bash
# 1. Hacer push del código
git push heroku main

# 2. Configurar base de datos en producción
heroku run pnpm db:deploy -a tu-app-name    # Aplicar migraciones
heroku run pnpm db:seed -a tu-app-name      # Poblar datos iniciales
```

#### Modo Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 📝 Flujo de Desarrollo Recomendado

#### 1. **Creando Nuevas Funcionalidades**

```bash
# 1. Crear nueva rama para la funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Estructurar según arquitectura
mkdir -p hooks/nueva-area
mkdir -p lib/nueva-area  
mkdir -p components/nueva-area

# 3. Implementar en orden:
# - Tipos TypeScript (si necesarios)
# - Funciones utilitarias (lib/)
# - Hooks de lógica (hooks/)
# - Componentes de UI (components/)

# 4. Actualizar barrel exports
echo "export * from './nuevo-hook';" >> hooks/nueva-area/index.ts
echo "export * from './nueva-util';" >> lib/nueva-area/index.ts
echo "export * from './nuevo-componente';" >> components/nueva-area/index.ts
```

#### 2. **Testing Durante Desarrollo**

```bash
# Ejecutar tests al crear nuevas funciones puras
pnpm test lib/nueva-area/

# Verificar types con TypeScript
pnpm type-check

# Lint y format automático
pnpm lint
pnpm format
```

#### 3. **Verificación Antes de Commit**

```bash
# 1. Verificar que compila sin errores
pnpm build

# 2. Ejecutar tests completos
pnpm test

# 3. Verificar que la BD funciona
pnpm db:studio  # Revisar en http://localhost:5555

# 4. Commit con mensaje descriptivo
git add .
git commit -m "feat(rooms): add room filtering by amenities

- Add filterByAmenities utility function
- Create useRoomAmenityFilter hook  
- Update RoomGrid to support amenity filtering
- Add AmenityFilter component"
```

#### 4. **Debugging y Development Tools**

```bash
# Ver base de datos gráficamente
pnpm db:studio

# Examinar esquema actual
pnpm db:inspect

# Reiniciar DB con datos frescos
pnpm db:reset && pnpm db:seed

# Ver logs del servidor
pnpm dev --turbo  # Modo turbo para builds más rápidos
```

#### Modo Producción

```bash
# Construir la aplicación
pnpm build

# Iniciar en modo producción
pnpm start
```

## 👥 Usuarios de Prueba

Después del seeding, tendrás estos usuarios disponibles:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| admin | admin@test.com | 123456 | SUPERADMIN |
| receptionist1 | receptionist@test.com | 123456 | RECEPTIONIST |
| housekeeper1 | housekeeper@test.com | 123456 | HOUSEKEEPER |

## 📁 Estructura del Proyecto

```
hotel-oasis-pms/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticación NextAuth
│   │   ├── bookings/             # Endpoints de reservas
│   │   ├── guests/               # Endpoints de huéspedes
│   │   ├── rooms/                # Endpoints de habitaciones
│   │   └── staff/                # Endpoints de personal
│   ├── dashboard/                # Páginas del dashboard
│   │   ├── bookings/             # Gestión de reservas
│   │   ├── guests/               # Gestión de huéspedes
│   │   ├── rooms/                # Gestión de habitaciones
│   │   └── staff/                # Gestión de personal
│   ├── login/                    # Página de login
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes React
│   ├── ui/                       # Primitivas de UI (Radix)
│   ├── auth/                     # Componentes de autenticación
│   ├── dashboard/                # Componentes del dashboard
│   ├── rooms/                    # 🆕 Componentes especializados de habitaciones
│   │   ├── room-card.tsx         # Tarjeta individual de habitación
│   │   ├── room-status-badge.tsx # Badge de estado
│   │   ├── room-amenities.tsx    # Lista de amenidades
│   │   ├── room-door-status.tsx  # Indicador de puerta
│   │   ├── room-actions.tsx      # Menú de acciones
│   │   ├── edit-room-dialog.tsx  # Modal de edición
│   │   └── index.ts              # Barrel exports
│   └── staff/                    # Componentes de personal
├── context/                      # Context Providers
├── hooks/                        # Custom Hooks
│   └── rooms/                    # 🆕 Hooks especializados de habitaciones
│       ├── use-rooms.ts          # Data fetching
│       ├── use-room-filters.ts   # Filtrado
│       ├── use-room-grouping.ts  # Agrupación/ordenamiento
│       ├── use-room-updates.ts   # Actualizaciones
│       ├── use-room-grid.ts      # Hook principal unificado
│       └── index.ts              # Barrel exports
├── lib/                          # Utilidades y configuración
│   ├── rooms/                    # 🆕 Lógica pura de habitaciones
│   │   ├── room-filters.ts       # Funciones de filtrado
│   │   ├── room-sorting.ts       # Funciones de ordenamiento
│   │   ├── room-utils.ts         # Utilidades generales
│   │   └── index.ts              # Barrel exports
│   ├── validations/              # Esquemas Zod
│   ├── room-constants.ts         # Constantes de habitaciones
│   ├── prisma.ts                 # Cliente Prisma
│   └── utils.ts                  # Utilidades generales
├── prisma/                       # Configuración Prisma
│   ├── schema.prisma             # Esquema de base de datos
│   └── migrations/               # Migraciones
├── services/                     # Lógica de negocio
├── scripts/                      # Scripts de utilidad
└── types/                        # Definiciones TypeScript
```

## 🏗️ Arquitectura de Componentes

El proyecto implementa una **arquitectura limpia** con separación clara de responsabilidades:

### 📋 Principios de Diseño

- **Separación de Concerns**: Lógica separada de presentación
- **Componentes Puros**: Solo se encargan del renderizado
- **Hooks Especializados**: Manejan estado y efectos
- **Funciones Utilitarias**: Lógica pura reutilizable
- **Tipado Fuerte**: TypeScript en toda la aplicación

### 🎯 Estructura por Capas

```
┌─────────────────────┐
│   Componentes UI    │ ← Solo presentación
├─────────────────────┤
│  Custom Hooks       │ ← Estado y efectos
├─────────────────────┤
│  Funciones Utils    │ ← Lógica pura
├─────────────────────┤
│   Servicios API     │ ← Comunicación backend
└─────────────────────┘
```

### 🧩 Ejemplo: Sistema de Habitaciones

#### **Componentes de Presentación** (`components/rooms/`)
```tsx
// Componentes especializados y reutilizables
<RoomCard />          // Tarjeta individual
<RoomStatusBadge />   // Badge de estado
<RoomAmenities />     // Lista de amenidades
<RoomDoorStatus />    // Indicador de puerta
<EditRoomDialog />    // Modal de edición
```

#### **Hooks de Lógica** (`hooks/rooms/`)
```tsx
// Hooks especializados para diferentes aspectos
useRooms()           // Data fetching con SWR
useRoomFilters()     // Filtrado inteligente
useRoomGrouping()    // Agrupación por piso
useRoomUpdates()     // Actualizaciones optimistas
useRoomGrid()        // Hook principal unificado
```

#### **Utilidades Puras** (`lib/rooms/`)
```tsx
// Funciones puras sin efectos secundarios
applyRoomFilters()   // Filtrado de datos
sortRooms()          // Ordenamiento
groupRoomsByFloor()  // Agrupación
formatRoomPrice()    // Formateo de precios
```

### 🔄 Flujo de Datos

```
API ──→ useRooms() ──→ useRoomFilters() ──→ useRoomGrouping() ──→ RoomGrid
                                                                      ↓
                                                                 RoomCard
```

### 📦 Uso de Componentes

#### **Básico - Componente Individual**
```tsx
import { RoomStatusBadge } from "@/components/rooms";

<RoomStatusBadge status="OCUPADA" />
```

#### **Intermedio - Hook Especializado**
```tsx
import { useRoomFilters } from "@/hooks/rooms";

const { filteredRooms, filterCount } = useRoomFilters(rooms, {
  searchQuery: "Suite",
  floorFilter: "3",
  typeFilter: "SUITE_A"
});
```

#### **Avanzado - Hook Principal**
```tsx
import { useRoomGrid } from "@/hooks/rooms";

const {
  displayRooms,
  groupedRooms,
  sortedFloors,
  isLoading,
  updateRoom
} = useRoomGrid({
  searchQuery,
  floorFilter,
  typeFilter
});
```

### ✨ Beneficios de la Arquitectura

- **🧪 Testeable**: Funciones puras fáciles de testear
- **🔄 Reutilizable**: Componentes y hooks reutilizables
- **📈 Escalable**: Fácil agregar nuevas funcionalidades
- **🛠️ Mantenible**: Código organizado y predecible
- **⚡ Performance**: Optimizaciones automáticas con memoización

## � Guía de Desarrollo

### 🎯 Creando Nuevos Componentes

#### 1. **Componentes de Presentación**
```tsx
// ✅ Correcto - Solo UI
interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
}

export function RoomCard({ room, onEdit }: RoomCardProps) {
  return (
    <Card>
      <RoomStatusBadge status={room.status} />
      <span>{room.number}</span>
      <button onClick={() => onEdit(room)}>Editar</button>
    </Card>
  );
}

// ❌ Incorrecto - Mezclando lógica
export function RoomCard({ roomId }: { roomId: string }) {
  const { data: room } = useSWR(`/api/rooms/${roomId}`); // ❌ Fetching en componente
  const [status, setStatus] = useState(room?.status); // ❌ Estado en presentación
  
  const updateStatus = async () => { /* ... */ }; // ❌ Lógica de negocio
  
  return <Card>...</Card>;
}
```

#### 2. **Custom Hooks**
```tsx
// ✅ Correcto - Hook especializado
export function useRoomUpdates() {
  const { mutate } = useSWRConfig();
  
  const updateRoom = useCallback(async (roomId: string, data: Partial<Room>) => {
    // Optimistic update
    await mutate(
      `/api/rooms/${roomId}`,
      updateRoomService(roomId, data),
      { optimisticData: data }
    );
  }, [mutate]);
  
  return { updateRoom };
}

// ❌ Incorrecto - Hook genérico sobrecargado
export function useRooms() {
  // ❌ Demasiadas responsabilidades en un solo hook
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  
  // 50+ líneas de lógica mezclada...
}
```

#### 3. **Funciones Utilitarias**
```tsx
// ✅ Correcto - Función pura
export function formatRoomPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

// ✅ Correcto - Función de filtrado
export function filterRoomsByType(rooms: Room[], type: RoomType): Room[] {
  return rooms.filter(room => room.type === type);
}

// ❌ Incorrecto - Función con efectos secundarios
export function updateRoomStatus(roomId: string, status: RoomStatus) {
  // ❌ Llamada a API en función utilitaria
  fetch(`/api/rooms/${roomId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
```

### 📁 Convenciones de Archivos

#### **Estructura de Hooks**
```
hooks/
├── rooms/
│   ├── use-rooms.ts          # Data fetching principal
│   ├── use-room-filters.ts   # Lógica de filtrado
│   ├── use-room-updates.ts   # Actualizaciones
│   ├── use-room-grid.ts      # Hook principal
│   └── index.ts              # Exports centralizados
```

#### **Estructura de Componentes**
```
components/
├── rooms/
│   ├── room-card.tsx         # PascalCase para componentes
│   ├── room-status-badge.tsx # kebab-case para archivos
│   ├── room-amenities.tsx    # Componentes específicos
│   └── index.ts              # Barrel exports
```

#### **Estructura de Utilidades**
```
lib/
├── rooms/
│   ├── room-filters.ts       # Funciones de filtrado
│   ├── room-sorting.ts       # Funciones de ordenamiento
│   ├── room-utils.ts         # Utilidades generales
│   └── index.ts              # Exports centralizados
```

### 🔄 Workflow de Desarrollo

1. **Análisis**: Identificar si es lógica de UI, estado, o función pura
2. **Ubicación**: Determinar carpeta correcta según responsabilidad
3. **Implementación**: Seguir patrones establecidos
4. **Testing**: Escribir tests unitarios para funciones puras
5. **Integración**: Usar barrel exports para imports limpios

### 📋 Checklist de Code Review

- [ ] ¿El componente solo se encarga de la presentación?
- [ ] ¿La lógica de estado está en hooks especializados?
- [ ] ¿Las funciones utilitarias son puras (sin efectos secundarios)?
- [ ] ¿Se usan los tipos de Prisma en lugar de interfaces duplicadas?
- [ ] ¿Los imports usan barrel exports cuando están disponibles?
- [ ] ¿Hay tests unitarios para las funciones puras?

## �🗃️ Base de Datos

### Modelos Principales

- **Guest**: Información de huéspedes
- **Room**: Habitaciones y sus características
- **Booking**: Reservas y relaciones
- **User**: Usuarios del sistema (personal)
- **Department**: Departamentos del hotel
- **Attendance**: Control de asistencias
- **Schedule**: Horarios de trabajo
- **Payment**: Pagos y transacciones

### Tipos de Habitación

- **SENCILLA**: Habitación individual estándar
- **SENCILLA_ESPECIAL**: Habitación individual premium
- **DOBLE**: Habitación doble estándar
- **DOBLE_ESPECIAL**: Habitación doble premium
- **SUITE_A**: Suite tipo A
- **SUITE_B**: Suite tipo B

## 🔐 Sistema de Roles

| Rol | Permisos |
|-----|----------|
| **SUPERADMIN** | Acceso total al sistema |
| **ADMIN** | Gestión completa excepto configuración crítica |
| **RECEPTIONIST** | Reservas, check-in/out, gestión de huéspedes |
| **HOUSEKEEPER** | Estado de habitaciones, limpieza |

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión

### Reservas
- `GET /api/bookings` - Listar reservas
- `POST /api/bookings` - Crear reserva
- `PUT /api/bookings/[id]` - Actualizar reserva
- `DELETE /api/bookings/[id]` - Eliminar reserva

### Habitaciones
- `GET /api/rooms` - Listar habitaciones
- `GET /api/rooms/available` - Habitaciones disponibles
- `PUT /api/rooms/[id]` - Actualizar habitación

### Personal
- `GET /api/staff` - Listar personal
- `POST /api/staff` - Crear empleado
- `PUT /api/staff/[id]` - Actualizar empleado
- `GET /api/staff/attendance` - Asistencias
- `GET /api/staff/schedules` - Horarios

## 📱 Scripts Disponibles

```bash
# Desarrollo (Base de datos local)
pnpm dev                    # Iniciar servidor de desarrollo
pnpm build                  # Construir para producción
pnpm start                  # Iniciar en modo producción
pnpm lint                   # Ejecutar linting

# Base de datos - Desarrollo Local
pnpm db:generate            # Generar cliente Prisma
pnpm db:migrate             # Ejecutar migraciones (desarrollo local)
pnpm db:seed                # Poblar base de datos (desarrollo local)

# Base de datos - Producción/Heroku ÚNICAMENTE
pnpm db:deploy              # Desplegar migraciones (solo producción)
heroku run pnpm db:deploy -a tu-app-name      # Migrar en Heroku
heroku run pnpm db:seed -a tu-app-name        # Sembrar datos en Heroku
DATABASE_URL="heroku_url" pnpm db:deploy      # Migrar desde local a Heroku
DATABASE_URL="heroku_url" pnpm db:seed        # Sembrar desde local a Heroku
```

## 🔧 Configuración Avanzada

### Personalización de Temas

El proyecto incluye soporte para modo claro/oscuro. Puedes personalizar los colores en:
- `tailwind.config.ts` - Configuración de Tailwind
- `app/globals.css` - Variables CSS personalizadas

### Configuración SMTP

Para habilitar el envío de emails de confirmación:

1. Configura las variables SMTP en `.env`
2. El servicio utilizará las plantillas en `services/emailService.ts`

### API Keys Externas

Para permitir acceso desde sistemas externos:

1. Define `ALLOWED_API_KEYS` en `.env`
2. Usa el header `x-api-key` en las peticiones

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js

### Heroku

#### Configuración de la Base de Datos

1. **Agregar Heroku Postgres Addon:**
```bash
heroku addons:create heroku-postgresql:essential-0 -a tu-app-name
```

2. **Configurar Variables de Entorno:**
```bash
heroku config:set NEXTAUTH_SECRET="tu_secreto_super_seguro" -a tu-app-name
heroku config:set NEXTAUTH_URL="https://tu-app-name.herokuapp.com" -a tu-app-name
heroku config:set NEXT_PUBLIC_API_KEY="key1" -a tu-app-name
```

3. **Desplegar Migraciones:**
```bash
# Después del primer deploy
heroku run pnpm db:deploy -a tu-app-name
```

4. **Poblar Base de Datos:**
```bash
heroku run pnpm db:seed -a tu-app-name
```

#### Scripts de Build para Heroku

Asegúrate de que tu `package.json` incluya:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Docker (Próximamente)

Se incluirá configuración Docker para facilitar el despliegue.

## 🎯 Ejemplos Prácticos

### 🏨 Ejemplo 1: Crear Nuevo Filtro de Habitaciones

```tsx
// 1. Función pura en lib/rooms/room-filters.ts
export function filterRoomsByCapacity(rooms: Room[], minCapacity: number): Room[] {
  return rooms.filter(room => room.capacity >= minCapacity);
}

// 2. Hook especializado en hooks/rooms/use-room-capacity-filter.ts
export function useRoomCapacityFilter(rooms: Room[]) {
  const [minCapacity, setMinCapacity] = useState(1);
  
  const filteredRooms = useMemo(
    () => filterRoomsByCapacity(rooms, minCapacity),
    [rooms, minCapacity]
  );
  
  return { filteredRooms, minCapacity, setMinCapacity };
}

// 3. Componente de UI en components/rooms/capacity-filter.tsx
export function CapacityFilter({ value, onChange }: CapacityFilterProps) {
  return (
    <Select value={value.toString()} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger>
        <SelectValue placeholder="Capacidad mínima" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1+ personas</SelectItem>
        <SelectItem value="2">2+ personas</SelectItem>
        <SelectItem value="4">4+ personas</SelectItem>
      </SelectContent>
    </Select>
  );
}

// 4. Integración en room-grid.tsx
const { filteredRooms, minCapacity, setMinCapacity } = useRoomCapacityFilter(rooms);

return (
  <div>
    <CapacityFilter value={minCapacity} onChange={setMinCapacity} />
    {filteredRooms.map(room => <RoomCard key={room.id} room={room} />)}
  </div>
);
```

### 📊 Ejemplo 2: Componente de Dashboard con Hooks

```tsx
// hooks/dashboard/use-hotel-stats.ts
export function useHotelStats() {
  const { data: rooms } = useRooms();
  const { data: bookings } = useBookings();
  
  const stats = useMemo(() => ({
    occupancyRate: calculateOccupancyRate(rooms, bookings),
    availableRooms: rooms?.filter(r => r.status === 'DISPONIBLE').length ?? 0,
    totalRevenue: calculateTotalRevenue(bookings),
    checkInsToday: getCheckInsToday(bookings)
  }), [rooms, bookings]);
  
  return { stats, isLoading: !rooms || !bookings };
}

// components/dashboard/hotel-stats.tsx
export function HotelStats() {
  const { stats, isLoading } = useHotelStats();
  
  if (isLoading) return <StatsLoading />;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Ocupación"
        value={`${stats.occupancyRate}%`}
        icon={<Hotel />}
      />
      <StatCard
        title="Habitaciones Disponibles"
        value={stats.availableRooms}
        icon={<Bed />}
      />
      <StatCard
        title="Ingresos Hoy"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign />}
      />
      <StatCard
        title="Check-ins Hoy"
        value={stats.checkInsToday}
        icon={<Calendar />}
      />
    </div>
  );
}
```

### 🔄 Ejemplo 3: Actualizaciones Optimistas

```tsx
// hooks/rooms/use-room-status-update.ts
export function useRoomStatusUpdate() {
  const { mutate } = useSWRConfig();
  
  const updateStatus = useCallback(async (roomId: string, newStatus: RoomStatus) => {
    const key = `/api/rooms/${roomId}`;
    
    try {
      // Actualización optimista
      await mutate(
        key,
        (current: Room) => ({ ...current, status: newStatus }),
        { revalidate: false }
      );
      
      // Actualización real
      await updateRoomService(roomId, { status: newStatus });
      
      // Revalidar para confirmar
      await mutate(key);
      
      toast.success(`Habitación ${roomId} actualizada a ${newStatus}`);
    } catch (error) {
      // Revertir en caso de error
      await mutate(key);
      toast.error('Error al actualizar habitación');
    }
  }, [mutate]);
  
  return { updateStatus };
}

// components/rooms/quick-status-buttons.tsx
export function QuickStatusButtons({ room }: { room: Room }) {
  const { updateStatus } = useRoomStatusUpdate();
  
  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        onClick={() => updateStatus(room.id, 'DISPONIBLE')}
        variant={room.status === 'DISPONIBLE' ? 'default' : 'outline'}
      >
        Disponible
      </Button>
      <Button 
        size="sm" 
        onClick={() => updateStatus(room.id, 'OCUPADA')}
        variant={room.status === 'OCUPADA' ? 'default' : 'outline'}
      >
        Ocupada
      </Button>
      <Button 
        size="sm" 
        onClick={() => updateStatus(room.id, 'MANTENIMIENTO')}
        variant={room.status === 'MANTENIMIENTO' ? 'default' : 'outline'}
      >
        Mantenimiento
      </Button>
    </div>
  );
}
```

## 🤝 Contribuir

### Proceso de Contribución

1. **Fork del proyecto** 
2. **Crea una rama para tu feature** (`git checkout -b feature/nueva-funcionalidad`)
3. **Sigue la arquitectura establecida**:
   - Funciones puras → `lib/`
   - Lógica de estado → `hooks/`
   - UI pura → `components/`
4. **Escribe tests** para funciones utilitarias
5. **Commit con mensajes descriptivos** siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
6. **Push a tu rama** (`git push origin feature/nueva-funcionalidad`)
7. **Abre un Pull Request**

### Estándares de Código

- ✅ **TypeScript estricto** - No usar `any`
- ✅ **Componentes puros** - Solo presentación
- ✅ **Hooks especializados** - Una responsabilidad por hook
- ✅ **Funciones puras** - Sin efectos secundarios en `lib/`
- ✅ **Barrel exports** - Usar archivos `index.ts`
- ✅ **Tests unitarios** - Para funciones de lógica de negocio

### Issues y Sugerencias

Si encuentras bugs o tienes ideas para mejoras:
1. Busca en los [issues existentes](../../issues)
2. Si no existe, [crea uno nuevo](../../issues/new)
3. Describe el problema o mejora detalladamente
4. Incluye steps to reproduce para bugs

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los [Issues](https://github.com/tu-usuario/hotel-oasis-pms/issues) existentes
3. Crea un nuevo Issue si es necesario

## 🔮 Roadmap

- [ ] Módulo de facturación avanzada
- [ ] Integración con sistemas de pago
- [ ] App móvil con React Native
- [ ] Dashboard analítico avanzado
- [ ] Integración con canales OTA
- [ ] Sistema de notificaciones push
- [ ] Módulo de mantenimiento
- [ ] Sistema de inventario de amenidades

---

**Hotel Oasis PMS** - *Tu hogar lejos de casa* 🏨
