// Página de ejemplo para demostrar los reportes de conceptos por turnos
// Archivo: app/dashboard/reports/page.tsx

import { Metadata } from 'next';
import { TurnConceptsReport } from '@/components/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reportes - Hotel Oasis PMS',
  description: 'Sistema de reportes financieros y operativos',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes detallados para análisis financiero y operativo
        </p>
      </div>

      {/* Resumen de tipos de reportes disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conceptos por Turnos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Movimientos financieros agrupados por turnos de trabajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Análisis de Ocupación
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Estadísticas de ocupación y disponibilidad
            </p>
            <p className="text-xs text-amber-600 mt-1">Próximamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rendimiento del Personal
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Métricas de productividad y asistencia
            </p>
            <p className="text-xs text-amber-600 mt-1">Próximamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reportes Personalizados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Crea reportes con filtros específicos
            </p>
            <p className="text-xs text-amber-600 mt-1">Próximamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Reporte principal */}
      <TurnConceptsReport />

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información sobre Reportes
          </CardTitle>
          <CardDescription>
            Detalles importantes sobre la generación de reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Formatos Disponibles</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>PDF:</strong> Documento formateado para impresión y archivo</li>
                <li>• <strong>JSON:</strong> Datos estructurados para análisis programático</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Opciones de Agrupación</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Por Turno:</strong> Agrupa movimientos por turnos de trabajo</li>
                <li>• <strong>Por Fecha:</strong> Organiza cronológicamente</li>
                <li>• <strong>Por Usuario:</strong> Filtra por responsable del movimiento</li>
                <li>• <strong>Por Moneda:</strong> Separa por tipo de divisa</li>
                <li>• <strong>Por Tipo de Pago:</strong> Clasifica según método de pago</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Notas Importantes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Los reportes incluyen todos los movimientos registrados en el período seleccionado</li>
              <li>• Los filtros vacíos incluyen automáticamente todas las opciones disponibles</li>
              <li>• Los reportes PDF incluyen metadatos de auditoría (usuario, fecha de generación)</li>
              <li>• Los datos se procesan en tiempo real desde la base de datos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
