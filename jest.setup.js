// jest.setup.js
// Configuración global para tests

// Establecer timeout más largo para operaciones de DB
jest.setTimeout(30000);

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';

// Log de inicio de tests
console.log('🧪 Jest setup: Configurando entorno de test');

// Manejo global de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
