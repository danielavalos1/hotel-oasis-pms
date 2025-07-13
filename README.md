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
│   └── staff/                    # Componentes de personal
├── context/                      # Context Providers
├── hooks/                        # Custom Hooks
├── lib/                          # Utilidades y configuración
│   ├── validations/              # Esquemas Zod
│   ├── prisma.ts                 # Cliente Prisma
│   └── utils.ts                  # Utilidades generales
├── prisma/                       # Configuración Prisma
│   ├── schema.prisma             # Esquema de base de datos
│   └── migrations/               # Migraciones
├── services/                     # Lógica de negocio
├── scripts/                      # Scripts de utilidad
└── types/                        # Definiciones TypeScript
```

## 🗃️ Base de Datos

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

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

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
