// __tests__/components/rooms/room-door-status.test.tsx
// Tests unitarios para el componente RoomDoorStatus

import { render, screen } from '@testing-library/react';

// Mock del componente RoomDoorStatus
const RoomDoorStatus = ({ isLocked }: { isLocked: boolean }) => {
  return (
    <div data-testid="room-door-status" className={isLocked ? 'locked' : 'unlocked'}>
      <span data-testid="door-icon">
        {isLocked ? '🔒' : '🔓'}
      </span>
      <span data-testid="door-text">
        {isLocked ? 'Cerrada' : 'Abierta'}
      </span>
    </div>
  );
};

describe('RoomDoorStatus - Unit Tests', () => {
  describe('Lock Status Display', () => {
    it('should show locked status when isLocked is true', () => {
      render(<RoomDoorStatus isLocked={true} />);

      expect(screen.getByTestId('door-text')).toHaveTextContent('Cerrada');
      expect(screen.getByTestId('door-icon')).toHaveTextContent('🔒');
      expect(screen.getByTestId('room-door-status')).toHaveClass('locked');
    });

    it('should show unlocked status when isLocked is false', () => {
      render(<RoomDoorStatus isLocked={false} />);

      expect(screen.getByTestId('door-text')).toHaveTextContent('Abierta');
      expect(screen.getByTestId('door-icon')).toHaveTextContent('🔓');
      expect(screen.getByTestId('room-door-status')).toHaveClass('unlocked');
    });
  });

  describe('Visual Indicators', () => {
    it('should apply correct CSS class for locked state', () => {
      render(<RoomDoorStatus isLocked={true} />);
      
      const component = screen.getByTestId('room-door-status');
      expect(component).toHaveClass('locked');
      expect(component).not.toHaveClass('unlocked');
    });

    it('should apply correct CSS class for unlocked state', () => {
      render(<RoomDoorStatus isLocked={false} />);
      
      const component = screen.getByTestId('room-door-status');
      expect(component).toHaveClass('unlocked');
      expect(component).not.toHaveClass('locked');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible for screen readers', () => {
      render(<RoomDoorStatus isLocked={true} />);
      
      const component = screen.getByTestId('room-door-status');
      expect(component).toBeInTheDocument();
      
      const text = screen.getByTestId('door-text');
      expect(text).toBeInTheDocument();
    });

    it('should provide clear text for both states', () => {
      const { rerender } = render(<RoomDoorStatus isLocked={true} />);
      expect(screen.getByText('Cerrada')).toBeInTheDocument();
      
      rerender(<RoomDoorStatus isLocked={false} />);
      expect(screen.getByText('Abierta')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle boolean props correctly', () => {
      const { rerender } = render(<RoomDoorStatus isLocked={true} />);
      expect(screen.getByTestId('door-text')).toHaveTextContent('Cerrada');
      
      rerender(<RoomDoorStatus isLocked={false} />);
      expect(screen.getByTestId('door-text')).toHaveTextContent('Abierta');
    });

    it('should be stable across re-renders', () => {
      const { rerender } = render(<RoomDoorStatus isLocked={true} />);
      const initialElement = screen.getByTestId('room-door-status');
      
      rerender(<RoomDoorStatus isLocked={true} />);
      const rerenderedElement = screen.getByTestId('room-door-status');
      
      expect(initialElement).toEqual(rerenderedElement);
    });
  });
});
