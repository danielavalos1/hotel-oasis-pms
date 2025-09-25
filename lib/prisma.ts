import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // Configurar Prisma para usar tipos nativos de JavaScript
  // Esto es crucial para que los Decimal se conviertan automáticamente a números
});

// Extender el cliente para incluir configuración adicional si es necesario
// Esto asegura que los tipos Decimal se manejen correctamente
export default prisma;
