import Link from 'next/link'
import { Button } from '../../components/ui/button'

export default async function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
      <h1 className="text-3xl font-semibold">404 | Página no encontrada</h1>
      <p className="text-center text-muted-foreground">
        Lo sentimos, la ruta que buscas no existe dentro del dashboard.
      </p>
      <div className="flex space-x-2">
        <Link href="/dashboard">
          <Button>Inicio Dashboard</Button>
        </Link>
        <Link href="/dashboard/bookings">
          <Button variant="outline">Reservas</Button>
        </Link>
      </div>
    </div>
  )
}