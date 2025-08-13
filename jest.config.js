module.exports = {
  preset: "ts-jest",
  // Configuración para múltiples entornos de test
  projects: [
    {
      // Tests de API (Node.js environment)
      displayName: "API Tests",
      testEnvironment: "node", 
      testMatch: ["<rootDir>/__tests__/api/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      maxWorkers: 1, // API tests secuenciales para evitar conflictos de DB
      testTimeout: 30000,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      // Tests de Componentes (jsdom environment)
      displayName: "Component Tests",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/__tests__/components/**/*.test.tsx",
        "<rootDir>/__tests__/hooks/**/*.test.tsx",
        "<rootDir>/__tests__/lib/**/*.test.ts"
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.react.js'],
      // Configuración específica para React
      transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", {
          tsconfig: {
            jsx: "react-jsx",
          },
        }],
      },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    }
  ],
  // Configuración global
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};