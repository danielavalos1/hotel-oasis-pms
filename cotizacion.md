# **`Sistema de Gestión Hotelero (PMS).`**

**`Stack:`** `Next.js (App Router) · TypeScript · Prisma ORM · PostgreSQL · Despliegue en Heroku (desarrollo, pruebas y producción)`  
**`Propiedad del código:`** `Cliente (licencia perpetua para 1 hotel)`

---

## **`1) Resumen ejecutivo`**

`Se propone construir un sistema de gestión hotelero (PMS) robusto, moderno y seguro para operar un solo hotel, con módulos de operación diaria (recepción, limpieza, caja), configuración (habitaciones, tarifas, impuestos), contenido (blog), interfaces de programación de aplicaciones (API) para consumo externo y reportería avanzada. El sistema se diseña como monolito modular con control de acceso basado en roles (RBAC), auditoría y copias de seguridad automatizadas.`

---

## **`2) Alcance por módulos`**

### **`2.1 Operación y Backoffice`**

* **`Panel de control operativo`**`: indicadores clave (check‑ins, check‑outs, ocupación, tarifa diaria promedio — ADR, ingresos, estado de habitaciones).`

* **`Usuarios y roles`**`: recepcionistas, administradores, limpieza, clientes (portal de huésped opcional), permisos por acción (crear, editar, cancelar, exportar, visibilidad).`

* **`Habitaciones`**`: tipos, número, piso, estado (disponible, ocupada, mantenimiento, salida), amenidades y capacidad, bloqueo de inventario y mantenimientos programados.`

* **`Tarifas`**`: tarifas base por tipo de habitación, temporadas, fines de semana, códigos promocionales, restricciones (noches mínimas/máximas, closed to arrival/departure), impuestos y tasas.`

* **`Reservas`**`: motor de disponibilidad, búsqueda por fechas y huéspedes, asignación de habitación, cambios de fecha, upgrade/downgrade, overbooking controlado (si se habilita), políticas de cancelación y no show.`

* **`Registro de entrada y salida (check‑in/check‑out)`**`: pre‑registro de entrada con datos del huésped, contratos y firma digital, registro de depósitos, salida tardía y entrada temprana con cargos automáticos según reglas.`

* **`Movimientos (transacciones)`**`: cargos, abonos, folios por habitación y por reserva, cortes de caja, arqueos, recibos y notas de crédito; bitácora y trazabilidad (auditoría).`

* **`Configuración`**`: habitaciones, tipos, tarifas, políticas, impuestos, perfiles de personal, plantillas de correo/mensajería, textos legales, numeración de folios y branding.`

* **`Limpieza (housekeeping — recomendado)`**`: tablero por estado (sucia, en proceso, limpia, inspección), asignación de tareas, tiempos y prioridades.`

* **`Mantenimiento (recomendado)`**`: tickets por habitación/equipo, prioridades, acuerdos de nivel de servicio (SLA) y calendario.`

* **`Inventario de insumos (recomendado)`**`: amenidades y consumibles con salidas por habitación.`

### **`2.2 Contenido y Canales`**

* **`Blog y publicaciones`**`: crear, leer, actualizar, borrar (CRUD) con categorías, etiquetas, optimización básica para buscadores (metadatos y etiquetas de Open Graph), vistas previas y programaciones.`

* **`Páginas informativas (opcional)`**`: términos, políticas y preguntas frecuentes.`

* **`Portal de huésped (opcional)`**`: consulta de reserva, pre‑registro de entrada, recibos y solicitud de servicios.`

### **`2.3 Interfaces de Programación de Aplicaciones (API)`**

* **`Disponibilidad de habitaciones`** `(rango de fechas, ocupación, tarifas, impuestos).`

* **`Reservas`** `(crear, cancelar, consultar) y pagos (si se integra pasarela).`

* **`Contenido`** `(blogs y publicaciones).`

### **`2.4 Reportes y Métricas`**

* `Reportes operativos: ocupación diaria y mensual, ingresos por fuente, producción por tipo de habitación, pick‑up, cancelaciones, no shows, caja y auditoría nocturna.`

* `Métricas financieras: ADR, ingresos por habitación disponible (RevPAR), valor bruto de mercancía (GMV), impuestos y descuentos.`

* `Exportación a CSV/Excel y envíos programados por correo electrónico.`

### **`2.5 Integración con Administrador de Canales y Agencias (OTAs)`**

* **`Inventario unificado (pooled inventory)`**`: el PMS como fuente de verdad de habitaciones, tarifas y restricciones.`

* **`Sincronización ARI`** `(Disponibilidad, Tarifas e Inventario) + restricciones (noches mínimas/máximas, closed to arrival/departure, suspensión de ventas).`

* **`Reservas, modificaciones y cancelaciones`** `en tiempo real (webhooks/colas) con manejo idempotente, tolerancia a límites de consumo y reintentos exponenciales.`

* **`Mapeo`** `de tipos de habitación y planes tarifarios entre PMS ↔ proveedor (1:1, 1:N, N:1); pruebas de consistencia.`

* `Reglas de paridad tarifaria, redondeo, impuestos y comisiones por canal, conversión de moneda si aplica.`

* **`Prevención de sobreventa (overbooking)`**`: bloqueos atómicos, márgenes de seguridad y alertas.`

* **`Reconciliación`**`: producción por canal, comisión, neto/medio de pago, merchant of record.`

* **`Enfoques soportados`**`:`  
   `A) Vía Administrador de Canales (recomendado: SiteMinder, Cloudbeds, RateTiger u otro): un solo punto para ARI y reservas, menor tiempo y mantenimiento.`  
   `B) Integraciones directas por agencia (OTA): conectores específicos (Booking.com, Expedia, Airbnb), sujetos a ambiente de pruebas/certificación.`

---

## **`3) Requisitos no funcionales`**

* **`Seguridad`**`: RBAC granular, doble factor de autenticación (2FA) opcional, hashing Argon2, sesiones httpOnly, protección contra falsificación de solicitudes entre sitios (CSRF) y secuencias de comandos en sitios cruzados (XSS), auditoría por acción/usuario/dirección IP.`

* **`Calidad`**`: pruebas unitarias (núcleo) e integrales, pruebas de extremo a extremo (E2E) de flujos críticos (reservar, registro de entrada/salida, corte).`

* **`Disponibilidad`**`: despliegue en Heroku con canalizaciones (desarrollo/pruebas/producción), verificaciones de estado y ampliación automática (si aplica).`

* **`Copias de seguridad`**`: automáticas diarias de PostgreSQL (retención 30 días).`

* **`Observabilidad`**`: registros centralizados, alertas y seguimiento de errores.`

* **`Rendimiento`**`: consultas optimizadas con Prisma e índices, caché selectiva.`

* **`Internacionalización`**`: contenidos y formatos español/inglés preparados.`

* **`Privacidad`**`: políticas de datos y consentimiento.`

---

## **`4) Arquitectura técnica`**

* **`Interfaz`**`: Next.js + TypeScript, componentes del servidor cuando convenga, interfaz accesible, renderizado del lado del servidor (SSR) / rehidratación (ISR), formularios con validación (Zod).`

* **`Servidor`**`: rutas de Next.js (REST), Prisma, PostgreSQL, colas y trabajos programados (Heroku Scheduler/Redis opcional), OpenAPI.`

* **`Autenticación`**`: correo y contraseña, enlace mágico por correo u OAuth corporativo (opcional).`

* **`Infraestructura`**`: Heroku (procesos web y trabajador opcional), Heroku Postgres, copias de seguridad.`

* **`Costos de infraestructura`**`: no incluidos en esta cotización; el cliente los paga directamente al proveedor.`

---

## **`5) Entregables`**

* `Código fuente en repositorio privado (acceso del cliente).`

* `Ambientes: desarrollo, pruebas y producción.`

* `Documentación técnica (arquitectura y API) y manual de operación.`

* `Tablero de métricas preconfigurado.`

* `1 sesión de capacitación (hasta 4 horas) grabada.`

* **`Garantía`** `de 90 días por defectos posteriores a la salida a producción (go‑live).`

---

## **`6) Cronograma estimado`**

**`Duración total estimada:`** `12 a 16 semanas (según plan).`

* `Semana 1: Descubrimiento, mapeo de procesos y definición de indicadores.`

* `Semana 2: Diseño técnico, modelo de datos y esquemas de interfaz.`

* `Semanas 3–6: Núcleo (usuarios/roles, habitaciones, tarifas, reservas).`

* `Semanas 7–9: Registro de entrada/salida, caja/folios, limpieza y mantenimiento.`

* `Semana 10: Reportes, panel de métricas e API públicas.`

* `Semana 11: Aseguramiento de calidad, pruebas de extremo a extremo, rendimiento y seguridad.`

* `Semana 12: Pruebas de aceptación de usuario (UAT), capacitaciones, go‑live y garantía.`  
   `En paralelo: Integración con Administrador de Canales/OTAs (4–6 semanas tras acceso a ambiente de pruebas/credenciales) y certificación si aplica.`

---

## **`7) Supuestos y exclusiones`**

**`Incluye:`**

* `PMS para un solo hotel (una razón social, un inventario).`

* `1 pasarela de correo/SMTP y dominio ya provistos por el cliente.`

**`No incluye (cotiza aparte):`**

* `Pasarela de pagos (Stripe/PayPal) e integraciones bancarias.`

* **`Integración con Administrador de Canales/OTAs`** `(Booking/Expedia/Airbnb) — disponible como opcional.`

* `Facturación electrónica en México (CFDI).`

* `Dispositivos físicos (cerraduras, kioscos, lectores de identificación).`

* **`Migración masiva de datos históricos`** `(se cotiza por volumen).`

* `Costos de infraestructura Heroku y extensiones (pagos directos del cliente).`

* `Aplicación móvil nativa o aplicación web progresiva avanzada.`

---

## **`8) Estimación de horas por módulo`**

`Horas de ingeniería (desarrollo y pruebas del módulo). No incluyen tiempos de terceros.`

* `Base de proyecto e infraestructura: 16–24 h.`

* `Autenticación, control de acceso y auditoría base: 24–40 h.`

* `Usuarios y roles (interfaz y altas/bajas/cambios): 12–20 h.`

* `Panel de control operativo (indicadores del día): 20–32 h.`

* `Habitaciones (catálogo, estado y bloqueos): 20–32 h.`

* `Tarifas (temporadas, restricciones y promociones): 36–56 h.`

* `Reservas (disponibilidad, asignación, cambios y políticas): 60–90 h.`

* `Registro de entrada y salida: 24–40 h.`

* `Movimientos (cargos, abonos, folios, caja y arqueos): 40–64 h.`

* `Configuración (impuestos, plantillas, numeración y políticas): 18–28 h.`

* `Limpieza (housekeeping): 24–40 h.`

* `Mantenimiento (tickets y calendario): 16–28 h.`

* `Inventario de insumos (amenidades y consumibles): 20–32 h.`

* `Blog y publicaciones con optimización básica para buscadores: 12–20 h.`

* `Páginas informativas (términos, políticas y preguntas frecuentes): 8–12 h.`

* `Portal de huésped (consulta y pre‑registro de entrada): 32–48 h.`

* `API públicas y privadas, documentación, llaves, límites de consumo y webhooks: 40–64 h.`

* `Reportes y métricas (exportaciones y envíos programados): 40–64 h.`

* `Observabilidad, copias de seguridad y seguridad avanzada: 20–32 h.`

* `Pruebas unitarias, de integración y de extremo a extremo: 40–64 h.`

* `Aceptación de usuario, capacitación y go‑live: 20–32 h.`

* `Documentación técnica y manual de operación: 12–20 h.`

* `Gestión del proyecto y coordinación: 40–60 h.`

* **`Administrador de Canales (1 proveedor)`**`: 60–100 h.`

* **`Integración directa por agencia (OTA, por canal)`**`: 50–80 h por canal.`

**`Sumas orientativas por plan (trabajo en paralelo cuando sea posible):`**

* **`Mínimo Viable (MVP)`**`: ≈ 482–762 h (sin limpieza, mantenimiento, inventario ni portal de huésped).`

* **`Profesional (Pro)`**`: ≈ 534–850 h (MVP + limpieza + mantenimiento + blog).`

* **`Completo (Full)`**`: ≈ 586–930 h (Pro + inventario + portal de huésped).`

* **`Administrador de Canales (1)`**`: + 60–100 h.`

* **`Integración directa por agencia (cada una)`**`: + 50–80 h.`

---

## **`9) Precios`**

### **`9.1 Escenarios por plan (rango y estimado medio)`**

* **`MVP (≈ 482–762 h)`** `→ 360 MXN/h:`  
   `Rango: 482×360 = 173,520 MXN a 762×360 = 274,320 MXN.`  
   `Estimado medio: ((482+762)/2 = 622 h) → 223,920 MXN.`

* **`Pro (≈ 534–850 h)`** `→ 360 MXN/h:`  
   `Rango: 534×360 = 192,240 MXN a 850×360 = 306,000 MXN.`  
   `Estimado medio: ((534+850)/2 = 692 h) → 249,120 MXN.`

* **`Full (≈ 586–930 h)`** `→ 360 MXN/h:`  
   `Rango: 586×360 = 210,960 MXN a 930×360 = 334,800 MXN.`  
   `Estimado medio: ((586+930)/2 = 758 h) → 272, 880 MXN.`

`Los importes anteriores no incluyen impuestos ni costos de infraestructura.`

### **`9.2 Integraciones de canales`** 

* **`Administrador de Canales (60–100 h)`** `→ 360 MXN/h`  
   `Rango: 60×360 = 21,600 MXN a 100×360 = 36,000 MXN.`  
   `Estimado medio (80 h): 28,800 MXN.`

* **`Integración directa por agencia (50–80 h por canal)`** `→ 360 MXN/h`  
   `Rango: 50×360 = 18,000 MXN a 80×360 = 28,800 MXN (estimado medio 65 h → 23,400 MXN).`

---

## **`10) Opcionales basados en horas`**

* **`Widget público de reservas embebible`**`: 30–50 h.`

* **`Pagos en línea (Stripe/PayPal) con conciliación básica`**`: 20–32 h.`

* **`Facturación electrónica en México (CFDI) vía PAC`**`: 80–120 h.`

* **`Aplicación web progresiva (PWA) modo kiosco/tablet para recepción`**`: 16–28 h.`

* **`Migración histórica`** `(por cada 10 000 registros): 12–20 h.`

* **`Onboarding de canal`** `(alta de hotel, carga de contenidos, fotos y políticas): 10–18 h.`

* **`Tematización de interfaz a marca`** `(diseño + implementación): 16–24 h.`

---

## **`11) Términos de pago`**

* **`35 %`** `de anticipo con la firma.`

* **`35 %`** `contra entrega del ambiente de pruebas utilizable.`

* **`30 %`** `en la salida a producción (go‑live).`  
   `La facturación se realiza por hitos; los cambios de alcance se gestionan mediante órdenes de cambio.`

---

## **`12) Matriz de roles (ejemplo)`**

* **`Administrador`**`: acceso total, configuración, reportes y auditoría.`

* **`Recepción`**`: reservas, registro de entrada/salida, cargos/abonos, consulta de disponibilidad.`

* **`Limpieza`**`: tablero de tareas, actualización del estado de habitación, reporte de incidencias.`

* **`Cliente`**`: portal de huésped (si aplica), consulta y pre‑registro de entrada.`  
   `Permisos granulares por acción (crear, leer, editar, cancelar, exportar).`

---

## **`13) Riesgos y mitigación`**

* **`Cambios de alcance`**`: control con lista de trabajos priorizada y órdenes de cambio.`

* **`Estacionalidad y picos`**`: pruebas de carga antes de temporadas altas, ampliación automática y caché.`

* **`Datos sensibles`**`: cifrado en tránsito (TLS), controles de acceso y auditoría.`

---

## **`14) Glosario de siglas`**

* **`API`**`: Interfaz de Programación de Aplicaciones.`

* **`RBAC`**`: Control de acceso basado en roles.`

* **`2FA`**`: Doble factor de autenticación.`

* **`SLA`**`: Acuerdo de Nivel de Servicio.`

* **`ARI`**`: Disponibilidad, Tarifas e Inventario (Availability, Rates and Inventory).`

* **`ADR`**`: Tarifa diaria promedio (Average Daily Rate).`

* **`RevPAR`**`: Ingresos por habitación disponible (Revenue per Available Room).`

* **`UAT`**`: Pruebas de aceptación de usuario (User Acceptance Testing).`

* **`CSV`**`: Valores separados por comas (formato de archivo para datos tabulares).`

---

## **`15) Avances y estimaciones de cierre`**

`Estimaciones basadas en la revisión del código a la fecha; pueden ajustarse tras validación funcional y priorización.`

### **`15.1 Avance por módulo (core PMS)`**

| Módulo | Estado | % | Est. total (h) | Restante (h) |
|---|---|---:|---:|---:|
| Base de proyecto e infraestructura | Parcial | 80% | 20 | 4 |
| Autenticación, control de acceso y auditoría base | Parcial | 70% | 32 | 10 |
| Usuarios y roles (ABM) | Parcial | 60% | 16 | 6 |
| Panel de control operativo (indicadores) | Parcial | 40% | 26 | 16 |
| Habitaciones (catálogo, estado y bloqueos) | Base | 70% | 26 | 8 |
| Tarifas (temporadas, restricciones y promociones) | Parcial | 50% | 46 | 23 |
| Reservas (disponibilidad, asignación, cambios, políticas) | Base | 65% | 75 | 26 |
| Check‑in/Check‑out | En progreso | 30% | 32 | 22 |
| Movimientos/Folios/Caja/Arqueos | Pendiente | 0% | 52 | 52 |
| Configuración (impuestos, plantillas, numeración, políticas) | Parcial | 30% | 23 | 16 |
| Housekeeping (limpieza) | Pendiente | 0% | 32 | 32 |
| Mantenimiento (tickets y calendario) | Pendiente | 0% | 22 | 22 |
| Inventario de insumos (amenidades/consumibles) | Pendiente | 0% | 26 | 26 |
| Blog y publicaciones | Pendiente | 0% | 16 | 16 |
| Páginas informativas | Pendiente | 0% | 10 | 10 |
| Portal de huésped | Pendiente | 0% | 40 | 40 |
| API públicas/privadas, docs, llaves, límites, webhooks | Parcial | 50% | 52 | 26 |
| Reportes y métricas (exportes/envíos) | Parcial | 35% | 52 | 34 |
| Observabilidad, backups y seguridad avanzada | Parcial | 20% | 26 | 21 |
| Pruebas unitarias/integ./E2E | Parcial | 40% | 52 | 31 |
| UAT, capacitación y go‑live | Pendiente | 0% | 26 | 26 |
| Documentación técnica y manual de operación | Parcial | 10% | 16 | 14 |
| Gestión del proyecto y coordinación | En curso | 50% | 50 | 25 |

**Total horas restantes (core PMS): 506 h**

Notas rápidas de estado:
- Autenticación y sesiones operativas con NextAuth; endurecimiento, RBAC granular y auditoría quedan pendientes.  
- Reservas/Huéspedes/Habitaciones: base funcional con API y UI; faltan reglas avanzadas y flujos operativos completos (check‑in/out, caja).  
- Tarifas: módulo y rutas creadas; quedan reglas, pricing avanzado y cierre técnico (conversión Decimal→number) ya identificado.  
- Reportería: avance en reporte de conceptos por turno; falta suite operativa/financiera y plantillas finales.

### **`15.2 Opcionales — Integraciones de canales`**

| Módulo opcional | Estado | Est. total (h) |
|---|---|---:|
| Administrador de Canales (1 proveedor) | Pendiente | 80 |
| Integración directa por agencia (por canal) | Pendiente | 65 |

`Estos esfuerzos se suman al total del core si se incluyen en el alcance.`

### **`15.3 Calendario estimado dedicando 15 h/semana`**

- Horas restantes (core PMS): 506 h.  
- Dedicación semanal: 15 h/semana.  
- Tiempo estimado: 506 ÷ 15 ≈ 33.7 → ≈ 34 semanas.  

Si se incluyen opcionales:
- + Administrador de Canales (80 h) → + 80 ÷ 15 ≈ 5.3 semanas.  
- + 1 canal directo (65 h) → + 65 ÷ 15 ≈ 4.3 semanas por canal.  

`Plan sugerido: continuar por fases (operación diaria → caja/foliación → reportería/finanzas → pulido/QA), ajustando prioridades de acuerdo al valor operativo.`
