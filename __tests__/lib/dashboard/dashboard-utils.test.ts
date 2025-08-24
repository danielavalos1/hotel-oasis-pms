import { calculateOccupancyRate, formatCurrency, calculateRevenue, getDashboardMetrics } from '@/lib/dashboard/dashboard-utils';

// Mock data
const mockRooms = [
  { id: 1, isAvailable: true, pricePerNight: 100 },
  { id: 2, isAvailable: false, pricePerNight: 150 },
  { id: 3, isAvailable: true, pricePerNight: 200 },
  { id: 4, isAvailable: false, pricePerNight: 120 },
] as any[];

const mockBookings = [
  { id: 1, totalPrice: 300, status: 'CONFIRMED' },
  { id: 2, totalPrice: 450, status: 'CONFIRMED' },
  { id: 3, totalPrice: 200, status: 'CANCELLED' },
] as any[];

describe('Dashboard Utils', () => {
  describe('calculateOccupancyRate', () => {
    test('should calculate occupancy rate correctly', () => {
      const result = calculateOccupancyRate(4, 2);
      expect(result).toBe(50);
    });

    test('should handle zero total rooms', () => {
      const result = calculateOccupancyRate(0, 2);
      expect(result).toBe(0);
    });

    test('should handle zero occupied rooms', () => {
      const result = calculateOccupancyRate(4, 0);
      expect(result).toBe(0);
    });

    test('should handle 100% occupancy', () => {
      const result = calculateOccupancyRate(4, 4);
      expect(result).toBe(100);
    });
  });

  describe('formatCurrency', () => {
    test('should format currency with default USD', () => {
      const result = formatCurrency(1234.56);
      expect(result.includes('1,234.56')).toBe(true);
    });

    test('should format currency with custom currency', () => {
      const result = formatCurrency(1000, 'EUR');
      expect(result.includes('1,000.00')).toBe(true);
    });

    test('should handle zero amount', () => {
      const result = formatCurrency(0);
      expect(result.includes('0.00')).toBe(true);
    });

    test('should handle negative amounts', () => {
      const result = formatCurrency(-500);
      expect(result.includes('500.00')).toBe(true);
    });
  });

  describe('calculateRevenue', () => {
    test('should calculate total revenue from confirmed bookings', () => {
      const result = calculateRevenue(mockBookings);
      expect(result).toBe(750); // 300 + 450 (excluding cancelled)
    });

    test('should handle empty bookings array', () => {
      const result = calculateRevenue([]);
      expect(result).toBe(0);
    });

    test('should exclude non-confirmed bookings', () => {
      const mixedBookings = [
        { totalPrice: 100, status: 'CONFIRMED' },
        { totalPrice: 200, status: 'PENDING' },
        { totalPrice: 300, status: 'CANCELLED' },
      ];
      const result = calculateRevenue(mixedBookings);
      expect(result).toBe(100);
    });
  });

  describe('getDashboardMetrics', () => {
    test('should calculate dashboard metrics correctly', () => {
      const result = getDashboardMetrics(mockRooms, mockBookings, []);
      
      expect(result.totalRooms).toBe(4);
      expect(result.occupiedRooms).toBe(2);
      expect(result.occupancyRate).toBe(50);
      expect(result.totalRevenue).toBe(750);
      expect(result.totalGuests).toBe(0);
    });

    test('should handle empty data', () => {
      const result = getDashboardMetrics([], [], []);
      
      expect(result.totalRooms).toBe(0);
      expect(result.occupiedRooms).toBe(0);
      expect(result.occupancyRate).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.totalGuests).toBe(0);
    });
  });
});
