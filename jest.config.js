module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // Ejecutar tests de API secuencialmente para evitar conflictos de DB
  maxWorkers: 1,
  // Timeout más largo para tests que involucran DB
  testTimeout: 30000,
  // Configurar el entorno de test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};