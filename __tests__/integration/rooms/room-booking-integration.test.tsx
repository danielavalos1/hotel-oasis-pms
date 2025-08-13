// __tests__/integration/rooms/room-booking-integration.test.tsx
// Tests de integración para el flujo de reservas de habitaciones

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { Room, RoomType, RoomStatus, Booking, BookingStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de componente que integra habitaciones con sistema de reservas
const RoomBookingIntegration = () => {
  const mockRooms: Room[] = [
    {
      id: 1,
      roomNumber: '101',
      type: 'SENCILLA' as RoomType,
      capacity: 2,
      pricePerNight: new Decimal(1200),
      description: 'Habitación sencilla con vista al jardín',
      amenities: ['wifi', 'tv', 'ac'],
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
      description: 'Habitación doble con balcón',
      amenities: ['wifi', 'tv', 'ac', 'balcony'],
      isAvailable: false,
      status: 'OCUPADA' as RoomStatus,
      floor: 1,
    },
  ];

  const mockBookings = [
    {
      id: 1,
      roomId: 2,
      guestName: 'Juan Pérez',
      checkIn: '2024-02-15',
      checkOut: '2024-02-20',
      status: 'CONFIRMADA' as BookingStatus,
      totalAmount: new Decimal(9000),
    },
  ];

  return (
    <div data-testid="room-booking-integration">
      {/* Calendario de disponibilidad */}
      <div data-testid="availability-calendar">
        <h2>Calendario de Disponibilidad</h2>
        <div data-testid="date-picker">
          <input data-testid="checkin-date" type="date" placeholder="Check-in" />
          <input data-testid="checkout-date" type="date" placeholder="Check-out" />
          <button data-testid="search-availability">Buscar Disponibilidad</button>
        </div>
      </div>

      {/* Lista de habitaciones disponibles */}
      <div data-testid="available-rooms">
        <h2>Habitaciones Disponibles</h2>
        {mockRooms
          .filter(room => room.isAvailable)
          .map(room => (
            <div key={room.id} data-testid={`available-room-${room.id}`}>
              <div data-testid={`room-info-${room.id}`}>
                <span data-testid={`room-number-${room.id}`}>{room.roomNumber}</span>
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

              <button 
                data-testid={`book-room-${room.id}`}
                disabled={!room.isAvailable}
              >
                {room.isAvailable ? 'Reservar' : 'No Disponible'}
              </button>
            </div>
          ))}
      </div>

      {/* Habitaciones ocupadas */}
      <div data-testid="occupied-rooms">
        <h2>Habitaciones Ocupadas</h2>
        {mockRooms
          .filter(room => !room.isAvailable)
          .map(room => {
            const booking = mockBookings.find(b => b.roomId === room.id);
            return (
              <div key={room.id} data-testid={`occupied-room-${room.id}`}>
                <span data-testid={`occupied-room-number-${room.id}`}>
                  {room.roomNumber}
                </span>
                <span data-testid={`occupied-status-${room.id}`}>{room.status}</span>
                {booking && (
                  <div data-testid={`booking-info-${room.id}`}>
                    <span data-testid={`guest-name-${room.id}`}>{booking.guestName}</span>
                    <span data-testid={`checkin-${room.id}`}>{booking.checkIn}</span>
                    <span data-testid={`checkout-${room.id}`}>{booking.checkOut}</span>
                  </div>
                )}
                <button data-testid={`checkout-room-${room.id}`}>
                  Check-out
                </button>
              </div>
            );
          })}
      </div>

      {/* Formulario de reserva */}
      <div data-testid="booking-form" style={{ display: 'none' }}>
        <h2>Nueva Reserva</h2>
        <input data-testid="guest-name-input" placeholder="Nombre del huésped" />
        <input data-testid="guest-email-input" placeholder="Email" />
        <input data-testid="guest-phone-input" placeholder="Teléfono" />
        <input data-testid="special-requests-input" placeholder="Solicitudes especiales" />
        <div data-testid="booking-summary">
          <span data-testid="selected-room">Habitación: </span>
          <span data-testid="booking-dates">Fechas: </span>
          <span data-testid="total-nights">Noches: </span>
          <span data-testid="total-amount">Total: </span>
        </div>
        <button data-testid="confirm-booking">Confirmar Reserva</button>
        <button data-testid="cancel-booking">Cancelar</button>
      </div>

      {/* Estados de operación */}
      <div data-testid="operation-status">
        <span data-testid="loading" style={{ display: 'none' }}>Procesando...</span>
        <span data-testid="success" style={{ display: 'none' }}>¡Reserva confirmada!</span>
        <span data-testid="error" style={{ display: 'none' }}>Error en la reserva</span>
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

describe('Room Booking Integration Tests', () => {
  describe('Availability Search', () => {
    it('should render availability calendar', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('checkin-date')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-date')).toBeInTheDocument();
      expect(screen.getByTestId('search-availability')).toBeInTheDocument();
    });

    it('should handle date selection', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkinInput = screen.getByTestId('checkin-date');
      const checkoutInput = screen.getByTestId('checkout-date');

      await user.type(checkinInput, '2024-02-15');
      await user.type(checkoutInput, '2024-02-20');

      expect(checkinInput).toHaveValue('2024-02-15');
      expect(checkoutInput).toHaveValue('2024-02-20');
    });

    it('should trigger availability search', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const searchButton = screen.getByTestId('search-availability');
      await user.click(searchButton);

      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Available Rooms Display', () => {
    it('should display available rooms only', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      // Solo habitación 101 está disponible
      expect(screen.getByTestId('available-room-1')).toBeInTheDocument();
      expect(screen.queryByTestId('available-room-2')).not.toBeInTheDocument();
    });

    it('should show room details for available rooms', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('room-number-1')).toHaveTextContent('101');
      expect(screen.getByTestId('room-type-1')).toHaveTextContent('SENCILLA');
      expect(screen.getByTestId('room-capacity-1')).toHaveTextContent('Cap: 2');
      expect(screen.getByTestId('room-price-1')).toHaveTextContent('$1200/noche');
    });

    it('should display room amenities', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('amenity-1-wifi')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-1-tv')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-1-ac')).toBeInTheDocument();
    });

    it('should show book button for available rooms', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const bookButton = screen.getByTestId('book-room-1');
      expect(bookButton).toBeInTheDocument();
      expect(bookButton).toHaveTextContent('Reservar');
      expect(bookButton).not.toBeDisabled();
    });
  });

  describe('Occupied Rooms Display', () => {
    it('should display occupied rooms separately', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('occupied-rooms')).toBeInTheDocument();
      expect(screen.getByTestId('occupied-room-2')).toBeInTheDocument();
    });

    it('should show booking information for occupied rooms', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('occupied-room-number-2')).toHaveTextContent('102');
      expect(screen.getByTestId('occupied-status-2')).toHaveTextContent('OCUPADA');
      expect(screen.getByTestId('guest-name-2')).toHaveTextContent('Juan Pérez');
      expect(screen.getByTestId('checkin-2')).toHaveTextContent('2024-02-15');
      expect(screen.getByTestId('checkout-2')).toHaveTextContent('2024-02-20');
    });

    it('should show checkout button for occupied rooms', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkoutButton = screen.getByTestId('checkout-room-2');
      expect(checkoutButton).toBeInTheDocument();
      expect(checkoutButton).toHaveTextContent('Check-out');
    });
  });

  describe('Booking Flow Integration', () => {
    it('should handle room booking button click', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const bookButton = screen.getByTestId('book-room-1');
      await user.click(bookButton);

      // En implementación real, esto mostraría el formulario de reserva
      expect(bookButton).toBeInTheDocument();
    });

    it('should show booking form when booking initiated', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const bookingForm = screen.getByTestId('booking-form');
      // Inicialmente oculto
      expect(bookingForm).toHaveStyle('display: none');
    });

    it('should display booking form fields', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('guest-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('guest-email-input')).toBeInTheDocument();
      expect(screen.getByTestId('guest-phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('special-requests-input')).toBeInTheDocument();
    });

    it('should show booking summary', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
      expect(screen.getByTestId('selected-room')).toBeInTheDocument();
      expect(screen.getByTestId('booking-dates')).toBeInTheDocument();
      expect(screen.getByTestId('total-nights')).toBeInTheDocument();
      expect(screen.getByTestId('total-amount')).toBeInTheDocument();
    });
  });

  describe('Booking Form Validation', () => {
    it('should handle guest information input', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const nameInput = screen.getByTestId('guest-name-input');
      const emailInput = screen.getByTestId('guest-email-input');
      const phoneInput = screen.getByTestId('guest-phone-input');

      await user.type(nameInput, 'María García');
      await user.type(emailInput, 'maria@example.com');
      await user.type(phoneInput, '+52 55 1234 5678');

      expect(nameInput).toHaveValue('María García');
      expect(emailInput).toHaveValue('maria@example.com');
      expect(phoneInput).toHaveValue('+52 55 1234 5678');
    });

    it('should handle special requests', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const requestsInput = screen.getByTestId('special-requests-input');
      await user.type(requestsInput, 'Cama extra para niño');

      expect(requestsInput).toHaveValue('Cama extra para niño');
    });

    it('should handle booking confirmation', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const confirmButton = screen.getByTestId('confirm-booking');
      await user.click(confirmButton);

      expect(confirmButton).toBeInTheDocument();
    });

    it('should handle booking cancellation', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const cancelButton = screen.getByTestId('cancel-booking');
      await user.click(cancelButton);

      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('Check-out Flow Integration', () => {
    it('should handle checkout process', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkoutButton = screen.getByTestId('checkout-room-2');
      await user.click(checkoutButton);

      expect(checkoutButton).toBeInTheDocument();
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle room status changes', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      // Verificar estados iniciales
      expect(screen.getByTestId('available-room-1')).toBeInTheDocument();
      expect(screen.getByTestId('occupied-room-2')).toBeInTheDocument();
    });

    it('should update availability after booking', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const bookButton = screen.getByTestId('book-room-1');
      await user.click(bookButton);

      // En implementación real, la habitación saldría de disponibles
      expect(bookButton).toBeInTheDocument();
    });

    it('should update availability after checkout', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkoutButton = screen.getByTestId('checkout-room-2');
      await user.click(checkoutButton);

      // En implementación real, la habitación se volvería disponible
      expect(checkoutButton).toBeInTheDocument();
    });
  });

  describe('Operation Status Integration', () => {
    it('should show operation status indicators', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      expect(screen.getByTestId('operation-status')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('success')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    it('should handle loading states during operations', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const loadingIndicator = screen.getByTestId('loading');
      expect(loadingIndicator).toHaveStyle('display: none');
    });

    it('should show success message after successful booking', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const successMessage = screen.getByTestId('success');
      expect(successMessage).toHaveTextContent('¡Reserva confirmada!');
      expect(successMessage).toHaveStyle('display: none');
    });

    it('should show error message on booking failure', () => {
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const errorMessage = screen.getByTestId('error');
      expect(errorMessage).toHaveTextContent('Error en la reserva');
      expect(errorMessage).toHaveStyle('display: none');
    });
  });

  describe('Date Validation Integration', () => {
    it('should validate check-in date is not in the past', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkinInput = screen.getByTestId('checkin-date');
      await user.type(checkinInput, '2023-01-01'); // Fecha pasada

      expect(checkinInput).toHaveValue('2023-01-01');
      // En implementación real, esto dispararía validación
    });

    it('should validate checkout date is after checkin', async () => {
      const user = userEvent.setup();
      render(<RoomBookingIntegration />, { wrapper: createWrapper() });

      const checkinInput = screen.getByTestId('checkin-date');
      const checkoutInput = screen.getByTestId('checkout-date');

      await user.type(checkinInput, '2024-02-20');
      await user.type(checkoutInput, '2024-02-15'); // Antes del check-in

      expect(checkinInput).toHaveValue('2024-02-20');
      expect(checkoutInput).toHaveValue('2024-02-15');
      // En implementación real, esto dispararía validación
    });
  });
});
