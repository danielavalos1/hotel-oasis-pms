// __tests__/hooks/rooms/use-rooms.test.tsx
// Test para el hook useRooms con MSW

import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { useRooms } from '@/hooks/rooms/use-rooms';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

// Wrapper para SWR
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
};

describe('useRooms', () => {
  it('should fetch rooms successfully', async () => {
    const { result } = renderHook(() => useRooms(), {
      wrapper: createWrapper(),
    });

    // Estado inicial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.rooms).toEqual([]);

    // Esperar a que se complete el fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar datos cargados
    expect(result.current.rooms).toHaveLength(3);
    expect(result.current.rooms[0]).toMatchObject({
      id: 1,
      roomNumber: '101',
      type: 'SENCILLA',
      status: 'LIBRE',
    });
    expect(result.current.error).toBeFalsy();
  });

  it('should handle API errors', async () => {
    // Override el handler para simular error
    server.use(
      http.get('/api/rooms', () => {
        return new HttpResponse('Internal Server Error', { status: 500 });
      })
    );

    const { result } = renderHook(() => useRooms(), {
      wrapper: createWrapper(),
    });

    // Esperar a que se complete el fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar manejo de error
    expect(result.current.error).toBeTruthy();
    expect(result.current.rooms).toEqual([]);
  });

  it('should refetch data when mutate is called', async () => {
    const { result } = renderHook(() => useRooms(), {
      wrapper: createWrapper(),
    });

    // Esperar datos iniciales
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rooms).toHaveLength(3);

    // Simular cambio en los datos del servidor
    server.use(
      http.get('/api/rooms', () => {
        return HttpResponse.json([
          {
            id: 1,
            roomNumber: '101',
            type: 'SENCILLA',
            capacity: 2,
            pricePerNight: 1200,
            description: 'Updated room',
            amenities: ['wifi'],
            isAvailable: true,
            status: 'OCUPADA', // Estado cambiado
            floor: 1,
          },
        ]);
      })
    );

    // Llamar mutate para refetch
    await result.current.mutate();

    // Verificar datos actualizados
    await waitFor(() => {
      expect(result.current.rooms).toHaveLength(1);
      expect(result.current.rooms[0].status).toBe('OCUPADA');
    });
  });

  it('should provide mutate function for cache updates', async () => {
    const { result } = renderHook(() => useRooms(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar que mutate es una función
    expect(typeof result.current.mutate).toBe('function');
  });
});
