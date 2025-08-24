import { formatGuestName, searchGuests, sortGuestsByName } from '../../../lib/guests/guest-utils';

// Mock guest data
const mockGuests = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phoneNumber: '+1234567890',
    address: '123 Main St',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phoneNumber: '+0987654321',
    address: '456 Oak Ave',
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@email.com',
    phoneNumber: '+1122334455',
    address: '789 Pine St',
  },
] as any[];

describe('Guest Utils', () => {
  describe('formatGuestName', () => {
    test('should format full name correctly', () => {
      const result = formatGuestName(mockGuests[0]);
      expect(result).toBe('John Doe');
    });

    test('should handle missing last name', () => {
      const guestWithoutLastName = { ...mockGuests[0], lastName: '' };
      const result = formatGuestName(guestWithoutLastName);
      expect(result).toBe('John');
    });

    test('should handle both missing names', () => {
      const guestWithoutNames = { ...mockGuests[0], firstName: '', lastName: '' };
      const result = formatGuestName(guestWithoutNames);
      expect(result).toBe('');
    });
  });

  describe('searchGuests', () => {
    test('should return all guests when search query is empty', () => {
      const result = searchGuests(mockGuests, '');
      expect(result.length).toBe(mockGuests.length);
    });

    test('should search guests by first name', () => {
      const result = searchGuests(mockGuests, 'john');
      expect(result.length).toBe(2);
      expect(result[0].firstName).toBe('John');
    });

    test('should search guests by last name', () => {
      const result = searchGuests(mockGuests, 'smith');
      expect(result.length).toBe(1);
      expect(result[0].lastName).toBe('Smith');
    });

    test('should search guests by email', () => {
      const result = searchGuests(mockGuests, 'jane.smith@email.com');
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('jane.smith@email.com');
    });

    test('should search guests by phone number', () => {
      const result = searchGuests(mockGuests, '+1122334455');
      expect(result.length).toBe(1);
      expect(result[0].phoneNumber).toBe('+1122334455');
    });

    test('should be case insensitive', () => {
      const result = searchGuests(mockGuests, 'ROBERT');
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('Robert');
    });

    test('should return empty array when no matches found', () => {
      const result = searchGuests(mockGuests, 'nonexistent');
      expect(result.length).toBe(0);
    });
  });

  describe('sortGuestsByName', () => {
    test('should sort guests by name in ascending order', () => {
      const result = sortGuestsByName([...mockGuests], 'asc');
      expect(result[0].firstName).toBe('Jane');
      expect(result[1].firstName).toBe('John');
      expect(result[2].firstName).toBe('Robert');
    });

    test('should sort guests by name in descending order', () => {
      const result = sortGuestsByName([...mockGuests], 'desc');
      expect(result[0].firstName).toBe('Robert');
      expect(result[1].firstName).toBe('John');
      expect(result[2].firstName).toBe('Jane');
    });

    test('should not mutate original array', () => {
      const originalGuests = [...mockGuests];
      const result = sortGuestsByName(mockGuests, 'asc');
      expect(mockGuests).not.toBe(result);
      expect(mockGuests.length).toBe(originalGuests.length);
    });
  });
});
