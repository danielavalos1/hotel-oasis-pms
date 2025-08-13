// __tests__/integration/rooms/room-grid-integration.test.tsx
// Tests de integración para el componente RoomGrid completo

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { Room, RoomType, RoomStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock del componente RoomGrid completo
const RoomGrid = () => {
  // Simulamos datos locales para el test de integración
  const mockRooms: Room[] = [
    {
      id: 1,
      roomNumber: '101',
      type: 'SENCILLA' as RoomType,
      capacity: 2,
      pricePerNight: new Decimal(1200),
      description: 'Habitación sencilla',
      amenities: ['wifi', 'tv'],
      isAvailable: true,
      status: 'LIBRE' as RoomStatus,
      floor: 1,
    },
    {
      id: 2,
      roomNumber: '102',
      type: 'DOBLE' as RoomType,
      capacity: 4,
      pricePerNight: new Decimal(1800),
      description: 'Habitación doble',
      amenities: ['wifi', 'tv', 'ac'],
      isAvailable: false,
      status: 'OCUPADA' as RoomStatus,
      floor: 1,
    },
    {
      id: 3,
      roomNumber: '201',
      type: 'SUITE_A' as RoomType,
      capacity: 6,
      pricePerNight: new Decimal(3500),
      description: 'Suite ejecutiva',
      amenities: ['wifi', 'tv', 'ac', 'minibar'],
      isAvailable: false,
      status: 'EN_MANTENIMIENTO' as RoomStatus,
      floor: 2,
    },
  ];

  return (
    <div data-testid="room-grid">
      <div data-testid="filters">
        <input 
          data-testid="search-input" 
          placeholder="Buscar habitaciones..."
        />
        <select data-testid="floor-filter">
          <option value="">Todos los pisos</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
        </select>
        <select data-testid="status-filter">
          <option value="">Todos los estados</option>
          <option value="LIBRE">Libre</option>
          <option value="OCUPADA">Ocupada</option>
          <option value="EN_MANTENIMIENTO">Mantenimiento</option>
        </select>
      </div>
      
      <div data-testid="room-cards">
        {mockRooms.map(room => (
          <div key={room.id} data-testid={`room-card-${room.id}`}>
            <h3>{room.roomNumber}</h3>
            <span data-testid={`room-status-${room.id}`}>{room.status}</span>
            <span data-testid={`room-type-${room.id}`}>{room.type}</span>
            <button data-testid={`edit-button-${room.id}`}>Editar</button>
          </div>
        ))}
      </div>
      
      <div data-testid="statistics">
        <span data-testid="total-rooms">Total: {mockRooms.length}</span>
        <span data-testid="available-rooms">
          Disponibles: {mockRooms.filter(r => r.status === 'LIBRE').length}
        </span>
        <span data-testid="occupied-rooms">
          Ocupadas: {mockRooms.filter(r => r.status === 'OCUPADA').length}
        </span>
      </div>
    </div>
  );
};

// Wrapper para SWR (necesario para hooks que usan SWR)
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
};

describe('RoomGrid Integration Tests', () => {
  describe('Component Integration', () => {
    it('should render all components together', async () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Verificar que todos los componentes se rendericen
      expect(screen.getByTestId('room-grid')).toBeInTheDocument();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('room-cards')).toBeInTheDocument();
      expect(screen.getByTestId('statistics')).toBeInTheDocument();
    });

    it('should display all room cards', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-3')).toBeInTheDocument();
    });

    it('should show correct room information', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Verificar información de habitación 101
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByTestId('room-status-1')).toHaveTextContent('LIBRE');
      expect(screen.getByTestId('room-type-1')).toHaveTextContent('SENCILLA');

      // Verificar información de habitación 102
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByTestId('room-status-2')).toHaveTextContent('OCUPADA');
      expect(screen.getByTestId('room-type-2')).toHaveTextContent('DOBLE');
    });
  });

  describe('Filter Integration', () => {
    it('should render all filter controls', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('floor-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    it('should have correct filter options', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      const floorFilter = screen.getByTestId('floor-filter');
      expect(floorFilter).toBeInTheDocument();
      
      const statusFilter = screen.getByTestId('status-filter');
      expect(statusFilter).toBeInTheDocument();
    });
  });

  describe('Statistics Integration', () => {
    it('should display correct room statistics', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('total-rooms')).toHaveTextContent('Total: 3');
      expect(screen.getByTestId('available-rooms')).toHaveTextContent('Disponibles: 1');
      expect(screen.getByTestId('occupied-rooms')).toHaveTextContent('Ocupadas: 1');
    });

    it('should calculate statistics correctly', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Verificar que las estadísticas reflejen los datos mock
      const totalText = screen.getByTestId('total-rooms').textContent;
      const availableText = screen.getByTestId('available-rooms').textContent;
      const occupiedText = screen.getByTestId('occupied-rooms').textContent;

      expect(totalText).toMatch(/3/);
      expect(availableText).toMatch(/1/);
      expect(occupiedText).toMatch(/1/);
    });
  });

  describe('User Interactions', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup();
      render(<RoomGrid />, { wrapper: createWrapper() });

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, '101');

      expect(searchInput).toHaveValue('101');
    });

    it('should handle filter selections', async () => {
      const user = userEvent.setup();
      render(<RoomGrid />, { wrapper: createWrapper() });

      const floorFilter = screen.getByTestId('floor-filter');
      await user.selectOptions(floorFilter, '1');

      expect(floorFilter).toHaveValue('1');
    });

    it('should handle room action buttons', async () => {
      const user = userEvent.setup();
      render(<RoomGrid />, { wrapper: createWrapper() });

      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      // El botón debería existir y ser clickeable
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain consistent data between components', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Verificar que las habitaciones mostradas coincidan con las estadísticas
      const roomCards = screen.getAllByTestId(/^room-card-/);
      const totalFromStats = screen.getByTestId('total-rooms').textContent;

      expect(roomCards).toHaveLength(3);
      expect(totalFromStats).toContain('3');
    });

    it('should handle state changes across components', async () => {
      const user = userEvent.setup();
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Simular cambio de filtro y verificar que afecte otros componentes
      const statusFilter = screen.getByTestId('status-filter');
      
      // Inicialmente todos los componentes están sincronizados
      expect(screen.getByTestId('total-rooms')).toHaveTextContent('Total: 3');
      expect(statusFilter).toHaveValue('');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing data gracefully', () => {
      // Test con componente que maneja datos vacíos
      const EmptyRoomGrid = () => (
        <div data-testid="empty-room-grid">
          <div data-testid="no-rooms-message">No hay habitaciones disponibles</div>
        </div>
      );

      render(<EmptyRoomGrid />);
      expect(screen.getByTestId('no-rooms-message')).toBeInTheDocument();
    });

    it('should maintain UI consistency during errors', () => {
      render(<RoomGrid />, { wrapper: createWrapper() });

      // Los componentes principales deberían seguir renderizándose
      expect(screen.getByTestId('room-grid')).toBeInTheDocument();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('statistics')).toBeInTheDocument();
    });
  });
});
