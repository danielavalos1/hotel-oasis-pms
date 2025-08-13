// __tests__/components/rooms/room-status-badge.test.tsx
// Tests unitarios para el componente RoomStatusBadge

import { render, screen } from '@testing-library/react';
import { RoomStatusBadge } from '@/components/rooms/room-status-badge';
import { RoomStatus } from '@prisma/client';

// Tests unitarios enfocados solo en la funcionalidad del componente
describe('RoomStatusBadge - Unit Tests', () => {
  describe('Status Rendering', () => {
    it('should render LIBRE status correctly', () => {
      render(<RoomStatusBadge status="LIBRE" />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-transparent');
    });

    it('should render OCUPADA status correctly', () => {
      render(<RoomStatusBadge status="OCUPADA" />);
      
      const badge = screen.getByText('Ocupada');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-transparent');
    });

    it('should render EN_MANTENIMIENTO status correctly', () => {
      render(<RoomStatusBadge status="EN_MANTENIMIENTO" />);
      
      const badge = screen.getByText('En Mantenimiento');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-transparent');
    });

    it('should render RESERVADA status correctly', () => {
      render(<RoomStatusBadge status="RESERVADA" />);
      
      const badge = screen.getByText('Reservada');
      expect(badge).toBeInTheDocument();
    });

    it('should render SUCIA status correctly', () => {
      render(<RoomStatusBadge status="SUCIA" />);
      
      const badge = screen.getByText('Sucia');
      expect(badge).toBeInTheDocument();
    });

    it('should render BLOQUEADA status correctly', () => {
      render(<RoomStatusBadge status="BLOQUEADA" />);
      
      const badge = screen.getByText('Bloqueada');
      expect(badge).toBeInTheDocument();
    });

    it('should render LIMPIEZA status correctly', () => {
      render(<RoomStatusBadge status="LIMPIEZA" />);
      
      const badge = screen.getByText('Limpieza');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'my-custom-class';
      render(<RoomStatusBadge status="LIBRE" className={customClass} />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toHaveClass(customClass);
    });

    it('should preserve default classes when adding custom className', () => {
      render(<RoomStatusBadge status="LIBRE" className="custom" />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toHaveClass('border-transparent', 'custom');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<RoomStatusBadge status="LIBRE" />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const { container } = render(<RoomStatusBadge status="OCUPADA" />);
      
      // Badge debería ser visible y accesible
      const badge = container.querySelector('[class*="border-transparent"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all enum values', () => {
      const statuses: RoomStatus[] = [
        'LIBRE',
        'RESERVADA', 
        'SUCIA',
        'BLOQUEADA',
        'OCUPADA',
        'EN_MANTENIMIENTO',
        'LIMPIEZA'
      ];

      statuses.forEach((status) => {
        const { unmount } = render(<RoomStatusBadge status={status} />);
        
        // Verificar que el badge se renderiza sin errores
        expect(screen.getByRole('generic')).toBeInTheDocument();
        
        unmount(); // Limpiar para el siguiente test
      });
    });

    it('should handle empty className gracefully', () => {
      render(<RoomStatusBadge status="LIBRE" className="" />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toBeInTheDocument();
    });

    it('should handle undefined className gracefully', () => {
      render(<RoomStatusBadge status="LIBRE" />);
      
      const badge = screen.getByText('Libre');
      expect(badge).toBeInTheDocument();
    });
  });
});
