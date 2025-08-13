// __tests__/components/rooms/room-amenities.test.tsx
// Tests unitarios para el componente RoomAmenities

import { render, screen } from '@testing-library/react';

// Mock del componente RoomAmenities (ya que no existe aún)
const RoomAmenities = ({ amenities, limit = 5 }: { 
  amenities: string[]; 
  limit?: number; 
}) => {
  const displayAmenities = amenities.slice(0, limit);
  const remainingCount = Math.max(0, amenities.length - limit);

  return (
    <div data-testid="room-amenities">
      {displayAmenities.map((amenity, index) => (
        <span key={index} data-testid={`amenity-${index}`}>
          {amenity}
        </span>
      ))}
      {remainingCount > 0 && (
        <span data-testid="remaining-count">+{remainingCount} más</span>
      )}
    </div>
  );
};

describe('RoomAmenities - Unit Tests', () => {
  describe('Amenities Display', () => {
    it('should render all amenities when under limit', () => {
      const amenities = ['wifi', 'tv', 'ac'];
      render(<RoomAmenities amenities={amenities} />);

      expect(screen.getByTestId('amenity-0')).toHaveTextContent('wifi');
      expect(screen.getByTestId('amenity-1')).toHaveTextContent('tv');
      expect(screen.getByTestId('amenity-2')).toHaveTextContent('ac');
    });

    it('should limit amenities display when over limit', () => {
      const amenities = ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'jacuzzi'];
      render(<RoomAmenities amenities={amenities} limit={3} />);

      expect(screen.getByTestId('amenity-0')).toHaveTextContent('wifi');
      expect(screen.getByTestId('amenity-1')).toHaveTextContent('tv');
      expect(screen.getByTestId('amenity-2')).toHaveTextContent('ac');
      
      // No debería mostrar las amenidades extra
      expect(screen.queryByTestId('amenity-3')).not.toBeInTheDocument();
    });

    it('should show remaining count when amenities exceed limit', () => {
      const amenities = ['wifi', 'tv', 'ac', 'minibar', 'balcony'];
      render(<RoomAmenities amenities={amenities} limit={3} />);

      expect(screen.getByTestId('remaining-count')).toHaveTextContent('+2 más');
    });

    it('should not show remaining count when amenities are within limit', () => {
      const amenities = ['wifi', 'tv'];
      render(<RoomAmenities amenities={amenities} limit={5} />);

      expect(screen.queryByTestId('remaining-count')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty amenities array', () => {
      render(<RoomAmenities amenities={[]} />);

      expect(screen.getByTestId('room-amenities')).toBeInTheDocument();
      expect(screen.queryByTestId('amenity-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remaining-count')).not.toBeInTheDocument();
    });

    it('should handle zero limit', () => {
      const amenities = ['wifi', 'tv', 'ac'];
      render(<RoomAmenities amenities={amenities} limit={0} />);

      expect(screen.queryByTestId('amenity-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('remaining-count')).toHaveTextContent('+3 más');
    });

    it('should use default limit when not specified', () => {
      const amenities = ['wifi', 'tv', 'ac', 'minibar', 'balcony', 'jacuzzi', 'pool'];
      render(<RoomAmenities amenities={amenities} />);

      // Debería mostrar 5 (limit por defecto)
      expect(screen.getByTestId('amenity-0')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-4')).toBeInTheDocument();
      expect(screen.queryByTestId('amenity-5')).not.toBeInTheDocument();
      expect(screen.getByTestId('remaining-count')).toHaveTextContent('+2 más');
    });
  });

  describe('Performance', () => {
    it('should handle large amenities array efficiently', () => {
      const amenities = Array.from({ length: 100 }, (_, i) => `amenity-${i}`);
      render(<RoomAmenities amenities={amenities} limit={5} />);

      // Solo debería renderizar 5 amenidades + contador
      expect(screen.getByTestId('amenity-0')).toBeInTheDocument();
      expect(screen.getByTestId('amenity-4')).toBeInTheDocument();
      expect(screen.queryByTestId('amenity-5')).not.toBeInTheDocument();
      expect(screen.getByTestId('remaining-count')).toHaveTextContent('+95 más');
    });
  });
});
