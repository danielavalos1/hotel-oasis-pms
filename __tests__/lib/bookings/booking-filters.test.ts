import { filterBookingsByStatus, filterBookingsByDate, filterBookingsByGuest } from '@/lib/bookings/booking-filters';

// Simple mock data that matches the basic structure
const mockBookings = [
  {
    id: 1,
    guestId: 1,
    checkInDate: new Date('2024-01-15'),
    checkOutDate: new Date('2024-01-18'),
    totalPrice: { toNumber: () => 300 }, // Mock Decimal
    status: 'CONFIRMED',
    numberOfGuests: 2,
  },
  {
    id: 2,
    guestId: 2,
    checkInDate: new Date('2024-02-01'),
    checkOutDate: new Date('2024-02-05'),
    totalPrice: { toNumber: () => 400 }, // Mock Decimal
    status: 'PENDING',
    numberOfGuests: 3,
  },
  {
    id: 3,
    guestId: 3,
    checkInDate: new Date('2024-01-20'),
    checkOutDate: new Date('2024-01-22'),
    totalPrice: { toNumber: () => 200 }, // Mock Decimal
    status: 'CANCELLED',
    numberOfGuests: 4,
  },
] as any[];

describe('Booking Filters', () => {
  describe('filterBookingsByStatus', () => {
    test('should return all bookings when status is "all"', () => {
      const result = filterBookingsByStatus(mockBookings, 'all');
      expect(result.length).toBe(mockBookings.length);
    });

    test('should filter bookings by CONFIRMED status', () => {
      const result = filterBookingsByStatus(mockBookings, 'CONFIRMED');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('CONFIRMED');
    });

    test('should filter bookings by PENDING status', () => {
      const result = filterBookingsByStatus(mockBookings, 'PENDING');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('PENDING');
    });

    test('should filter bookings by CANCELLED status', () => {
      const result = filterBookingsByStatus(mockBookings, 'CANCELLED');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('CANCELLED');
    });
  });

  describe('filterBookingsByDate', () => {
    test('should filter bookings by date range', () => {
      const startDate = new Date('2024-01-16');
      const endDate = new Date('2024-01-25');
      const result = filterBookingsByDate(mockBookings, startDate, endDate);
      expect(result.length).toBe(2); // Only booking with checkInDate in range
    });

    test('should include bookings that overlap with date range', () => {
      const startDate = new Date('2024-01-10');
      const endDate = new Date('2024-01-17');
      const result = filterBookingsByDate(mockBookings, startDate, endDate);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('filterBookingsByGuest', () => {
    test('should return all bookings when no guest search provided', () => {
      const result = filterBookingsByGuest(mockBookings, '');
      expect(result.length).toBe(mockBookings.length);
    });

    test('should filter bookings by guest ID in status', () => {
      // The current implementation searches in ID and status
      const result = filterBookingsByGuest(mockBookings, '1');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should filter bookings by status text', () => {
      const result = filterBookingsByGuest(mockBookings, 'confirmed');
      expect(result.length).toBe(1);
    });

    test('should return empty array when guest not found', () => {
      const result = filterBookingsByGuest(mockBookings, 'nonexistent');
      expect(result.length).toBe(0);
    });
  });
});
