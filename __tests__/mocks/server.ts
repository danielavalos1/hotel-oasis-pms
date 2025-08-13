// __tests__/mocks/server.ts
// Configuración del servidor MSW para tests

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configurar el servidor MSW
export const server = setupServer(...handlers);

// Configuración automática del servidor
global.beforeAll(() => {
  // Iniciar servidor antes de todos los tests
  server.listen({
    onUnhandledRequest: 'warn', // Advertir sobre requests no manejados
  });
});

global.afterEach(() => {
  // Limpiar handlers después de cada test
  server.resetHandlers();
});

global.afterAll(() => {
  // Cerrar servidor después de todos los tests
  server.close();
});
