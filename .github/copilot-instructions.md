# Instrucciones de GitHub Copilot para Hotel Oasis PMS

## Visión general del proyecto
- Aplicación de gestión hotelera full-stack con Next.js v15.1.5 y React v19.x.
- TypeScript para seguridad de tipos.
- Prisma v6.6.0 para acceso a base de datos relacional.
- Tailwind CSS v3.4.17 y Radix UI en `components/ui` para estilo y accesibilidad.

## Estructura clave
- `app/`: Router de Next.js (layouts, páginas, API routes en `app/api`).
- `components/`: Componentes React reutilizables.
- `components/ui/`: Primitivas de UI (basadas en Radix + Tailwind).
- `context/`: Providers de React Context (p. ej. AuthProvider).
- `services/`: Lógica de negocio con Prisma (`lib/prisma.ts`).
- `hooks/`: Hooks personalizados.
- `validations/`: Esquemas Zod para validación.
- `lib/`: Utilidades y configuración de cliente Prisma.

## Buenas prácticas
- Prefiere Server Components para fetch de datos y Client Components solo para UI interactiva.
- Encapsula llamadas a Prisma en `services/*`; no usar Prisma directo en componentes.
- Validar entradas externas con Zod antes de la capa de servicio.
- Componentes con responsabilidad única, props tipadas, usar `ComponentProps` o interfaces explícitas.
- Utilizar `cn` para merge de clases y tokens de diseño de `tailwind.config.ts` y variables CSS en `globals.css`.
- Extender las primitivas de `components/ui/*` para consistencia y accesibilidad.

## Convenciones de nombres
- Archivos en kebab-case, componentes React en PascalCase.
- Prefijos claros: Providers (`AuthProvider`), hooks (`useAuth`, `useToast`).
- Servicios nombrados por dominio (`bookingService`, `guestService`).

## Manejo de errores y notificaciones
- Lanzar errores descriptivos en servicios y capturar en rutas API con códigos HTTP.
- Notificaciones al usuario con `use-toast` en componentes cliente.

## Rendimiento y escalabilidad
- Utilizar caching de Next.js (`revalidate`, `cache`) según corresponda.
- Paginar conjuntos de datos grandes en rutas API con query params.

## Tipado y uso de interfaces
- Siempre que sea posible, utiliza los tipos e interfaces generados automáticamente por Prisma Client (`@prisma/client`) para modelar entidades, relaciones y DTOs en el backend y frontend.
- Extiende o transforma estos tipos solo cuando sea necesario para la UI o para exponer datos agregados/derivados, pero evita definir interfaces duplicadas para modelos que ya existen en Prisma.
- Si necesitas un DTO para la API, parte del tipo Prisma y omite/agrega campos según el caso, pero no redefinas la estructura base.
- En el frontend, importa los tipos de Prisma Client (o de un archivo de tipos centralizado) para mantener la consistencia y facilitar el mantenimiento a largo plazo.
