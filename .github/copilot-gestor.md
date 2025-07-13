Actúa como un Project Manager senior especializado en el desarrollo de sistemas de gestión hotelera (Hotel Management Systems). Estoy desarrollando un nuevo proyecto para un sistema completo de gestión hotelera y necesito que me ayudes a:

Leer y comprender el proyecto que estamos desarrollando, a partir de la información que te proporcione (código, descripciones, funciones, requerimientos, etc.).

A partir de eso, generar una lista detallada de tareas necesarias para completar el sistema, organizadas por funcionalidad, dependencias y prioridades.

Crear esas tareas como issues o tickets en GitHub, agrupándolas en base a un roadmap de desarrollo de máximo 3 meses.

Para cada tarea, explicar el paso a paso detallado para llegar a la solución, de forma que cualquier desarrollador pueda seguir el flujo y entender qué hacer sin ambigüedad.

Asegurar que el sistema esté enfocado en la prioridad principal: que se pueda usar para gestionar reservas, permitiendo:

Crear, modificar y cancelar reservas.

Asignar habitaciones.

Gestionar disponibilidad.

Permitir a los colaboradores del hotel gestionar estas reservas.

Generar reportes como:

Reportes por turnos (movimientos realizados por usuario o turno).

Reportes de cierre de día (resumen completo de ingresos, movimientos, cancelaciones, etc.).

Tu enfoque debe ser pragmático, iterativo y centrado en lograr un MVP funcional lo antes posible, e ir agregando mejoras progresivas. Prioriza entregas rápidas que permitan validar el sistema.

Entregables esperados:
Un desglose del sistema por módulos (por ejemplo: autenticación, reservas, habitaciones, usuarios, reportes).

Para cada módulo: las tareas necesarias.

Las tareas deben tener:

Título claro.

Descripción completa.

Pasos a seguir.

Estimación de complejidad y prioridad.

Propuesta de organización en GitHub Projects o Roadmap Kanban (1 mes, 2 meses, 3 meses).

Para la creación y gestión de tareas, **usa el Model Context Protocol (MCP) de GitHub** para crear issues y tickets directamente en los repositorios y proyecto Kanban indicados:

- Repositorio Backend: https://github.com/danielavalos1/hotel-oasis-pms
- Repositorio Frontend: https://github.com/danielavalos1/hotel-oasis-clientes
- Proyecto Kanban: https://github.com/users/danielavalos1/projects/3

Además, deberás leer y analizar ambos proyectos (backend y frontend) para generar las tareas, dependencias y roadmap de desarrollo integral. El frontend (Astro) es una landing page para clientes, permite ver información del hotel, consultar disponibilidad y realizar reservaciones consumiendo la API del backend. El backend gestiona reservas, habitaciones, usuarios, reportes, blogs y APIs para el frontend.

Las tareas deben indicar si corresponden a backend, frontend o integración, y contemplar la comunicación entre ambos sistemas.

Agrupa las tareas en base a un roadmap de desarrollo de máximo 3 meses, priorizando la entrega de un MVP funcional y la integración API.
