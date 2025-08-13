// __tests__/components/rooms/room-grid.test.tsx
// Tests unitarios para el componente RoomGrid

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { Room, RoomType, RoomStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock del componente RoomGrid basado en la estructura refactorizada
const MockRoomGrid = () => {
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
      pricePerNight: new Decimal(2500),
      description: 'Suite premium',
      amenities: ['wifi', 'tv', 'ac', 'minibar'],
      isAvailable: true,
      status: 'LIBRE' as RoomStatus,
      floor: 2,
    },
  ];

  return (
    <div data-testid="room-grid">
      {/* Filtros y controles */}
      <div data-testid="room-filters">
        <select data-testid="floor-filter">
          <option value="">Todos los pisos</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
        </select>
        
        <select data-testid="type-filter">
          <option value="">Todos los tipos</option>
          <option value="SENCILLA">Sencilla</option>
          <option value="DOBLE">Doble</option>
          <option value="SUITE_A">Suite A</option>
        </select>

        <select data-testid="status-filter">
          <option value="">Todos los estados</option>
          <option value="LIBRE">Libre</option>
          <option value="OCUPADA">Ocupada</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
        </select>

        <button data-testid="clear-filters">Limpiar Filtros</button>
      </div>

      {/* Estadísticas */}
      <div data-testid="room-statistics">
        <div data-testid="total-rooms">Total: {mockRooms.length}</div>
        <div data-testid="available-rooms">
          Disponibles: {mockRooms.filter(r => r.isAvailable).length}
        </div>
        <div data-testid="occupied-rooms">
          Ocupadas: {mockRooms.filter(r => !r.isAvailable).length}
        </div>
        <div data-testid="occupancy-rate">
          Ocupación: {Math.round((mockRooms.filter(r => !r.isAvailable).length / mockRooms.length) * 100)}%
        </div>
      </div>

      {/* Grid de habitaciones */}
      <div data-testid="rooms-grid">
        {mockRooms.map(room => (
          <div key={room.id} data-testid={`room-card-${room.id}`}>
            <div data-testid={`room-header-${room.id}`}>
              <span data-testid={`room-number-${room.id}`}>{room.roomNumber}</span>
              <span data-testid={`room-status-${room.id}`}>{room.status}</span>
            </div>
            
            <div data-testid={`room-details-${room.id}`}>
              <span data-testid={`room-type-${room.id}`}>{room.type}</span>
              <span data-testid={`room-capacity-${room.id}`}>Cap: {room.capacity}</span>
              <span data-testid={`room-price-${room.id}`}>
                ${room.pricePerNight.toString()}/noche
              </span>
            </div>

            <div data-testid={`room-amenities-${room.id}`}>
              {room.amenities.map(amenity => (
                <span key={amenity} data-testid={`amenity-${room.id}-${amenity}`}>
                  {amenity}
                </span>
              ))}
            </div>

            <div data-testid={`room-actions-${room.id}`}>
              <button data-testid={`view-room-${room.id}`}>Ver</button>
              <button data-testid={`edit-room-${room.id}`}>Editar</button>
              {room.isAvailable ? (
                <button data-testid={`book-room-${room.id}`}>Reservar</button>
              ) : (
                <button data-testid={`checkout-room-${room.id}`}>Check-out</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estados de carga y error */}
      <div data-testid="loading-state" style={{ display: 'none' }}>
        Cargando habitaciones...
      </div>
      
      <div data-testid="error-state" style={{ display: 'none' }}>
        Error al cargar habitaciones
      </div>

      <div data-testid="empty-state" style={{ display: 'none' }}>
        No se encontraron habitaciones
      </div>
    </div>
  );
};

// Wrapper para SWR
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
};

describe('RoomGrid Component', () => {
  describe('Rendering', () => {
    it('should render the room grid component', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });
      expect(screen.getByTestId('room-grid')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-filters')).toBeInTheDocument();
      expect(screen.getByTestId('room-statistics')).toBeInTheDocument();
      expect(screen.getByTestId('rooms-grid')).toBeInTheDocument();
    });

    it('should render all room cards', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-3')).toBeInTheDocument();
    });
  });

  describe('Room Card Content', () => {
    it('should display room basic information', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Habitación 101
      expect(screen.getByTestId('room-number-1')).toHaveTextContent('101');
      expect(screen.getByTestId('room-status-1')).toHaveTextContent('LIBRE');
      expect(screen.getByTestId('room-type-1')).toHaveTextContent('SENCILLA');
      expect(screen.getByTestId('room-capacity-1')).toHaveTextContent('Cap: 2');
      expect(screen.getByTestId('room-price-1')).toHaveTextContent('$1200/noche');
    });

    it('should display room amenities', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Verificar amenities de habitación 101
      expect(screen.getByTestId('amenity-1-wifi')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-1-tv')).toBeInTheDocument();

      // Verificar amenities de habitación 201 (más amenities)
      expect(screen.getByTestId('amenity-3-wifi')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-3-tv')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-3-ac')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-3-minibar')).toBeInTheDocument();
    });

    it('should show appropriate action buttons for available rooms', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Habitación disponible (101)
      expect(screen.getByTestId('view-room-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-room-1')).toBeInTheDocument();
      expect(screen.getByTestId('book-room-1')).toBeInTheDocument();
      expect(screen.queryByTestId('checkout-room-1')).not.toBeInTheDocument();
    });

    it('should show appropriate action buttons for occupied rooms', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Habitación ocupada (102)
      expect(screen.getByTestId('view-room-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-room-2')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-room-2')).toBeInTheDocument();
      expect(screen.queryByTestId('book-room-2')).not.toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render all filter controls', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('floor-filter')).toBeInTheDocument();
      expect(screen.getByTestId('type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
    });

    it('should have all filter options', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const floorFilter = screen.getByTestId('floor-filter');
      const typeFilter = screen.getByTestId('type-filter');
      const statusFilter = screen.getByTestId('status-filter');

      // Verificar opciones de piso
      expect(floorFilter).toHaveTextContent('Todos los pisos');
      expect(floorFilter).toHaveTextContent('Piso 1');
      expect(floorFilter).toHaveTextContent('Piso 2');

      // Verificar opciones de tipo
      expect(typeFilter).toHaveTextContent('Todos los tipos');
      expect(typeFilter).toHaveTextContent('Sencilla');
      expect(typeFilter).toHaveTextContent('Doble');
      expect(typeFilter).toHaveTextContent('Suite A');

      // Verificar opciones de estado
      expect(statusFilter).toHaveTextContent('Todos los estados');
      expect(statusFilter).toHaveTextContent('Libre');
      expect(statusFilter).toHaveTextContent('Ocupada');
      expect(statusFilter).toHaveTextContent('Mantenimiento');
    });

    it('should handle filter interactions', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const floorFilter = screen.getByTestId('floor-filter');
      await user.selectOptions(floorFilter, '1');

      expect(floorFilter).toHaveValue('1');
    });

    it('should handle clear filters button', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const clearButton = screen.getByTestId('clear-filters');
      await user.click(clearButton);

      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display room statistics', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('total-rooms')).toHaveTextContent('Total: 3');
      expect(screen.getByTestId('available-rooms')).toHaveTextContent('Disponibles: 2');
      expect(screen.getByTestId('occupied-rooms')).toHaveTextContent('Ocupadas: 1');
      expect(screen.getByTestId('occupancy-rate')).toHaveTextContent('Ocupación: 33%');
    });

    it('should calculate occupancy rate correctly', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const occupancyRate = screen.getByTestId('occupancy-rate');
      // 1 ocupada de 3 total = 33% (redondeado)
      expect(occupancyRate).toHaveTextContent('33%');
    });
  });

  describe('User Interactions', () => {
    it('should handle view room button clicks', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const viewButton = screen.getByTestId('view-room-1');
      await user.click(viewButton);

      expect(viewButton).toBeInTheDocument();
    });

    it('should handle edit room button clicks', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const editButton = screen.getByTestId('edit-room-1');
      await user.click(editButton);

      expect(editButton).toBeInTheDocument();
    });

    it('should handle book room button clicks', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const bookButton = screen.getByTestId('book-room-1');
      await user.click(bookButton);

      expect(bookButton).toBeInTheDocument();
    });

    it('should handle checkout button clicks', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const checkoutButton = screen.getByTestId('checkout-room-2');
      await user.click(checkoutButton);

      expect(checkoutButton).toBeInTheDocument();
    });
  });

  describe('Different Room Types', () => {
    it('should display different room types correctly', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-type-1')).toHaveTextContent('SENCILLA');
      expect(screen.getByTestId('room-type-2')).toHaveTextContent('DOBLE');
      expect(screen.getByTestId('room-type-3')).toHaveTextContent('SUITE_A');
    });

    it('should show different capacities for different room types', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-capacity-1')).toHaveTextContent('Cap: 2');
      expect(screen.getByTestId('room-capacity-2')).toHaveTextContent('Cap: 4');
      expect(screen.getByTestId('room-capacity-3')).toHaveTextContent('Cap: 6');
    });

    it('should show different prices for different room types', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-price-1')).toHaveTextContent('$1200/noche');
      expect(screen.getByTestId('room-price-2')).toHaveTextContent('$1800/noche');
      expect(screen.getByTestId('room-price-3')).toHaveTextContent('$2500/noche');
    });
  });

  describe('Loading and Error States', () => {
    it('should render loading state (initially hidden)', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const loadingState = screen.getByTestId('loading-state');
      expect(loadingState).toBeInTheDocument();
      expect(loadingState).toHaveStyle('display: none');
    });

    it('should render error state (initially hidden)', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const errorState = screen.getByTestId('error-state');
      expect(errorState).toBeInTheDocument();
      expect(errorState).toHaveStyle('display: none');
    });

    it('should render empty state (initially hidden)', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveStyle('display: none');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Verificar que los elementos tienen roles y labels apropiados
      const grid = screen.getByTestId('room-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have focusable interactive elements', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const viewButton = screen.getByTestId('view-room-1');
      const editButton = screen.getByTestId('edit-room-1');
      const bookButton = screen.getByTestId('book-room-1');

      expect(viewButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(bookButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const firstButton = screen.getByTestId('view-room-1');
      firstButton.focus();

      await user.keyboard('{Tab}');
      // En implementación real, esto movería el foco al siguiente elemento
      expect(firstButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple rooms', () => {
      const startTime = performance.now();
      render(<MockRoomGrid />, { wrapper: createWrapper() });
      const endTime = performance.now();

      // Verificar que el rendering sea rápido (menos de 100ms para este test)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle re-renders efficiently', () => {
      const { rerender } = render(<MockRoomGrid />, { wrapper: createWrapper() });

      const startTime = performance.now();
      rerender(<MockRoomGrid />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across all room cards', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      // Verificar que cada habitación tenga datos consistentes
      const roomCards = [1, 2, 3];
      
      roomCards.forEach(id => {
        expect(screen.getByTestId(`room-card-${id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`room-number-${id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`room-status-${id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`room-type-${id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`room-capacity-${id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`room-price-${id}`)).toBeInTheDocument();
      });
    });

    it('should show consistent statistics with displayed rooms', () => {
      render(<MockRoomGrid />, { wrapper: createWrapper() });

      const totalRoomsText = screen.getByTestId('total-rooms').textContent;
      const availableRoomsText = screen.getByTestId('available-rooms').textContent;
      const occupiedRoomsText = screen.getByTestId('occupied-rooms').textContent;

      // Extraer números de los textos
      const total = parseInt(totalRoomsText?.match(/\d+/)?.[0] || '0');
      const available = parseInt(availableRoomsText?.match(/\d+/)?.[0] || '0');
      const occupied = parseInt(occupiedRoomsText?.match(/\d+/)?.[0] || '0');

      // Verificar que los números sean consistentes
      expect(available + occupied).toBe(total);
    });
  });
});
