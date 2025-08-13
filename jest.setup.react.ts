// jest.setup.react.js
// Configuración específica para tests de componentes React

import '@testing-library/jest-dom';

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de Next Auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN'
      }
    },
    status: 'authenticated'
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de SWR para tests
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    mutate: jest.fn(),
    isLoading: false,
  })),
  useSWRConfig: () => ({
    mutate: jest.fn(),
    cache: new Map(),
  }),
}));

// Mock global de fetch para requests HTTP
global.fetch = jest.fn();

// Mock de window.matchMedia para tests que usan media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de ResizeObserver para componentes que lo usan
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Configuración para Radix UI Toast
global.console = {
  ...console,
  // Silenciar warnings específicos en tests
  warn: jest.fn(),
  error: jest.fn(),
};

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

console.log('🧪 Jest React setup: Configurando entorno de test para componentes');
