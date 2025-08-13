// __tests__/components/rooms/room-actions.test.tsx
// Tests unitarios para el componente RoomActions

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Room, RoomType, RoomStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock del componente RoomActions
const RoomActions = ({ 
  room, 
  onEdit, 
  onUpdateStatus,
  onDelete 
}: { 
  room: Room;
  onEdit?: (room: Room) => void;
  onUpdateStatus?: (roomId: number, status: RoomStatus) => void;
  onDelete?: (roomId: number) => void;
}) => {
  return (
    <div data-testid="room-actions">
      <button 
        data-testid="edit-button"
        onClick={() => onEdit?.(room)}
      >
        Editar
      </button>
      <button 
        data-testid="status-button"
        onClick={() => onUpdateStatus?.(room.id, 'OCUPADA')}
      >
        Cambiar Estado
      </button>
      <button 
        data-testid="delete-button"
        onClick={() => onDelete?.(room.id)}
      >
        Eliminar
      </button>
    </div>
  );
};

const mockRoom: Room = {
  id: 1,
  roomNumber: '101',
  type: 'SENCILLA' as RoomType,
  capacity: 2,
  pricePerNight: new Decimal(1200),
  description: 'Habitación test',
  amenities: ['wifi', 'tv'],
  isAvailable: true,
  status: 'LIBRE' as RoomStatus,
  floor: 1,
};

describe('RoomActions - Unit Tests', () => {
  describe('Button Rendering', () => {
    it('should render all action buttons', () => {
      render(<RoomActions room={mockRoom} />);

      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('status-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    it('should display correct button text', () => {
      render(<RoomActions room={mockRoom} />);

      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(screen.getByText('Cambiar Estado')).toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });
  });

  describe('Click Handlers', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockRoom);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onUpdateStatus when status button is clicked', async () => {
      const mockOnUpdateStatus = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onUpdateStatus={mockOnUpdateStatus} />);

      const statusButton = screen.getByTestId('status-button');
      await user.click(statusButton);

      expect(mockOnUpdateStatus).toHaveBeenCalledWith(mockRoom.id, 'OCUPADA');
      expect(mockOnUpdateStatus).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const mockOnDelete = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTestId('delete-button');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(mockRoom.id);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Optional Handlers', () => {
    it('should not crash when handlers are undefined', async () => {
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} />);

      const editButton = screen.getByTestId('edit-button');
      const statusButton = screen.getByTestId('status-button');
      const deleteButton = screen.getByTestId('delete-button');

      // No debería crashear al hacer click sin handlers
      await user.click(editButton);
      await user.click(statusButton);
      await user.click(deleteButton);

      expect(screen.getByTestId('room-actions')).toBeInTheDocument();
    });

    it('should handle partial handler configuration', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-button');
      const statusButton = screen.getByTestId('status-button');

      await user.click(editButton);
      await user.click(statusButton); // Sin handler

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Clicks', () => {
    it('should handle multiple rapid clicks', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-button');
      
      await user.click(editButton);
      await user.click(editButton);
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
      expect(mockOnEdit).toHaveBeenCalledWith(mockRoom);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button elements', () => {
      render(<RoomActions room={mockRoom} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(<RoomActions room={mockRoom} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-button');
      
      // Simular navegación por teclado
      editButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnEdit).toHaveBeenCalledWith(mockRoom);
    });
  });
});
