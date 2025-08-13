// __tests__/components/rooms/room-card.test.tsx
// Test básico para demostrar configuración

import { render, screen } from '@testing-library/react';

// Test simple para verificar que la configuración funciona
describe('RoomCard (Demo Test)', () => {
  it('should render a simple component', () => {
    render(<div data-testid="demo">Hello Testing World!</div>);
    
    expect(screen.getByTestId('demo')).toBeInTheDocument();
    expect(screen.getByText('Hello Testing World!')).toBeInTheDocument();
  });

  it('should handle async operations', async () => {
    render(<div data-testid="async">Async Test</div>);
    
    const element = await screen.findByTestId('async');
    expect(element).toBeInTheDocument();
  });
});
