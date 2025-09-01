# Instrucciones de GitHub Copilot para Hotel Oasis PMS

## Visión general del proyecto
- Aplicación de gestión hotelera full-stack con Next.js v15.1.5 y React v19.x.
- TypeScript para seguridad de tipos.
- Prisma v6.6.0 para acceso a base de datos relacional.
- Tailwind CSS v3.4.17 y Radix UI en `components/ui` para estilo y accesibilidad.
- Cypress para testing E2E y Component Testing.
- Jest para testing unitario de funciones puras y servicios.
- **pdf-node** para generación de reportes PDF desde plantillas HTML.

## Generación de reportes PDF
- **Dependencia**: `pdf-node` para convertir HTML a PDF con soporte para CSS y JavaScript.
- **Ubicación**: `lib/reports/` - Lógica centralizada para generación de PDFs.
- **Estructura de reportes**:
  - `lib/reports/generators/` - Funciones específicas para cada tipo de reporte
  - `lib/reports/templates/` - Plantillas HTML/CSS para los PDFs
  - `lib/reports/utils/` - Utilidades comunes (formateo, configuración)
  - `lib/reports/types.ts` - Tipos TypeScript para configuración de reportes
  - `lib/reports/index.ts` - Barrel exports
- **API Routes**: `app/api/reports/` - Endpoints para solicitar y descargar PDFs.
- **Tipos de reportes**: Reservas, huéspedes, habitaciones, personal, finanzas.
- **Configuración**: Opciones de formato (A4, carta), orientación, márgenes, headers/footers.

## Estructura clave - Organización modular
La aplicación está organizada por **módulos funcionales** para facilitar la reutilización y mantenimiento:

### Estructura base
- `app/`: Router de Next.js (layouts, páginas, API routes en `app/api`).
- `components/ui/`: Primitivas de UI base (Radix + Tailwind).
- `context/`: Providers de React Context globales.
- `lib/`: Utilidades puras y configuración base (Prisma, utils generales).
- `services/`: Lógica de negocio centralizada con Prisma.
- `validations/`: Esquemas Zod para validación de datos.

### Módulos especializados por funcionalidad
- `components/[modulo]/`: Componentes UI específicos del módulo
  - `components/rooms/`: Sistema de habitaciones
  - `components/bookings/`: Sistema de reservas  
  - `components/guests/`: Sistema de huéspedes
  - `components/staff/`: Sistema de personal
  - `components/dashboard/`: Componentes del dashboard
  - `components/auth/`: Componentes de autenticación
  - `components/reports/`: Componentes para visualización y descarga de reportes

- `hooks/[modulo]/`: Hooks especializados por módulo
  - `hooks/rooms/`: Lógica de estado para habitaciones
  - `hooks/bookings/`: Lógica de estado para reservas
  - `hooks/staff/`: Lógica de estado para personal
  - `hooks/reports/`: Hooks para generación y gestión de reportes
  - Cada módulo incluye: data fetching, filtros, agrupación, actualizaciones

- `lib/[modulo]/`: Funciones utilitarias puras por módulo
  - `lib/rooms/`: Utilidades de habitaciones (filtros, sorting, validaciones)
  - `lib/bookings/`: Utilidades de reservas
  - `lib/staff/`: Utilidades de personal
  - `lib/reports/`: Generación de PDFs, plantillas HTML, formateo de datos
  - Cada módulo incluye `index.ts` para barrel exports

### Organización de tests
- `__tests__/api/`: Tests unitarios para API routes con Jest
- `cypress/e2e/`: Tests E2E con Cypress
- `cypress/component/`: Tests de componentes con Cypress
- `cypress/fixtures/`: Datos de prueba
- `cypress/support/`: Comandos personalizados y configuración

## Buenas prácticas
- Prefiere Server Components para fetch de datos y Client Components solo para UI interactiva.
- Encapsula llamadas a Prisma en `services/*`; no usar Prisma directo en componentes.
- Validar entradas externas con Zod antes de la capa de servicio.
- Componentes con responsabilidad única, props tipadas, usar `ComponentProps` o interfaces explícitas.
- Utilizar `cn` para merge de clases y tokens de diseño de `tailwind.config.ts` y variables CSS en `globals.css`.
- Extender las primitivas de `components/ui/*` para consistencia y accesibilidad.
- Organizar código por módulos funcionales con barrel exports en archivos `index.ts`.
- Seguir arquitectura de capas: UI → Hooks → Utils → Services.

## Testing y calidad
### Jest (Testing unitario)
- Tests unitarios para funciones puras en `lib/[modulo]/*` y servicios en `services/*`.
- Tests de API routes en `__tests__/api/` con supertest.
- Mocks de Prisma para tests de servicios.
- Configuración en `jest.config.js` y `jest.setup.js`.

### Cypress (E2E y Component Testing)
- **Configuración**: `cypress.config.ts` con soporte para E2E y Component Testing.
- **E2E Tests**: Flujos completos de usuario en `cypress/e2e/`.
- **Component Tests**: Tests aislados de componentes en `cypress/component/`.
- **Scripts npm**:
  - `"cypress:open"`: Abrir Cypress UI
  - `"e2e"`: E2E en modo interactivo
  - `"e2e:headless"`: E2E en CI/CD
  - `"component"`: Component testing interactivo
  - `"component:headless"`: Component testing en CI/CD
- **Comandos personalizados**: Definir en `cypress/support/commands.ts`.
- **Fixtures**: Datos de prueba en `cypress/fixtures/`.
- **Consideraciones**:
  - E2E requiere servidor Next.js ejecutándose (`npm run build && npm run start`).
  - Component testing no soporta async Server Components.
  - Usar `baseUrl: 'http://localhost:3000'` en configuración.
  - Instalar `start-server-and-test` para automatizar servidor en CI.

## Convenciones de nombres
- Archivos en kebab-case, componentes React en PascalCase.
- Prefijos claros: Providers (`AuthProvider`), hooks (`useAuth`, `useToast`).
- Servicios nombrados por dominio (`bookingService`, `guestService`).
- Tests: `*.test.ts` para Jest, `*.cy.ts` para Cypress.
- Barrel exports en `index.ts` para cada módulo.

## Arquitectura modular
### Principios de organización
- **Separación por módulos funcionales**: Cada área de negocio en su propio módulo.
- **Capas bien definidas**: UI → Hooks → Utils → Services → Prisma.
- **Reutilización**: Componentes y hooks diseñados para reutilización.
- **Barrel exports**: Imports limpios con archivos `index.ts`.

### Ejemplo de estructura modular (sistema de habitaciones)
```
hooks/rooms/
  ├── use-rooms.ts          # Data fetching con SWR
  ├── use-room-filters.ts   # Lógica de filtrado
  ├── use-room-grouping.ts  # Agrupación y ordenamiento
  ├── use-room-updates.ts   # Actualizaciones optimistas
  ├── use-room-grid.ts      # Hook principal unificado
  └── index.ts              # Barrel exports

components/rooms/
  ├── room-card.tsx         # Tarjeta individual
  ├── room-status-badge.tsx # Badge de estado
  ├── room-amenities.tsx    # Lista de amenidades
  ├── room-actions.tsx      # Menú de acciones
  ├── edit-room-dialog.tsx  # Modal de edición
  └── index.ts              # Barrel exports

lib/rooms/
  ├── room-filters.ts       # Funciones de filtrado puras
  ├── room-sorting.ts       # Funciones de ordenamiento
  ├── room-utils.ts         # Utilidades generales
  └── index.ts              # Barrel exports

lib/reports/
  ├── generators/
  │   ├── booking-reports.ts    # Reportes de reservas
  │   ├── guest-reports.ts      # Reportes de huéspedes
  │   ├── room-reports.ts       # Reportes de habitaciones
  │   ├── staff-reports.ts      # Reportes de personal
  │   └── financial-reports.ts  # Reportes financieros
  ├── templates/
  │   ├── booking-template.html # Plantilla HTML para reservas
  │   ├── guest-template.html   # Plantilla HTML para huéspedes
  │   ├── room-template.html    # Plantilla HTML para habitaciones
  │   └── base-styles.css       # Estilos CSS comunes
  ├── utils/
  │   ├── pdf-config.ts         # Configuración de pdf-node
  │   ├── formatters.ts         # Funciones de formateo
  │   └── report-helpers.ts     # Utilidades específicas
  ├── types.ts                  # Tipos para reportes
  └── index.ts                  # Barrel exports

cypress/e2e/
  ├── rooms/
  │   ├── room-management.cy.ts
  │   └── room-filtering.cy.ts
  └── bookings/
      ├── booking-flow.cy.ts
      └── checkin-checkout.cy.ts

cypress/component/
  ├── rooms/
  │   ├── room-card.cy.tsx
  │   └── room-status-badge.cy.tsx
  └── bookings/
      └── booking-form.cy.tsx
```

## Manejo de errores y notificaciones
- Lanzar errores descriptivos en servicios y capturar en rutas API con códigos HTTP.
- Notificaciones al usuario con `use-toast` en componentes cliente.
- Tests de error scenarios en Jest y Cypress.

## Rendimiento y escalabilidad
- Utilizar caching de Next.js (`revalidate`, `cache`) según corresponda.
- Paginar conjuntos de datos grandes en rutas API con query params.
- Memoización en hooks con `useMemo` y `useCallback`.
- Componentes optimizados con `React.memo` cuando sea necesario.

## Tipado y uso de interfaces
- Siempre que sea posible, utiliza los tipos e interfaces generados automáticamente por Prisma Client (`@prisma/client`) para modelar entidades, relaciones y DTOs en el backend y frontend.
- Extiende o transforma estos tipos solo cuando sea necesario para la UI o para exponer datos agregados/derivados, pero evita definir interfaces duplicadas para modelos que ya existen en Prisma.
- Si necesitas un DTO para la API, parte del tipo Prisma y omite/agrega campos según el caso, pero no redefinas la estructura base.
- En el frontend, importa los tipos de Prisma Client (o de un archivo de tipos centralizado) para mantener la consistencia y facilitar el mantenimiento a largo plazo.
