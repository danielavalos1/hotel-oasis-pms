// Componente principal para generar reportes de conceptos por turnos
// Archivo: components/reports/turn-concepts-report.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Download, FileText, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TurnOption {
  numero: number;
  nombre: string;
  inicio: string;
  fin: string;
}

interface ReportConfig {
  dateFrom: string;
  dateTo: string;
  turnos: number[];
  currencies: string[];
  paymentTypes: string[];
  movementTypes: string[];
  groupBy: string;
  includeDetails: boolean;
  showTotals: boolean;
  format: string;
}

interface ApiOptions {
  groupBy: Array<{ value: string; label: string }>;
  currencies: Array<{ value: string; label: string }>;
  paymentTypes: Array<{ value: string; label: string }>;
  formats: Array<{ value: string; label: string }>;
}

export default function TurnConceptsReport() {
  const { toast } = useToast();
  
  // Estado del formulario
  const [config, setConfig] = useState<ReportConfig>({
    dateFrom: format(new Date(), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
    turnos: [],
    currencies: ['MXN'],
    paymentTypes: [],
    movementTypes: [],
    groupBy: 'turno',
    includeDetails: true,
    showTotals: true,
    format: 'PDF',
  });

  // Estados de carga
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Opciones disponibles
  const [turnos, setTurnos] = useState<TurnOption[]>([]);
  const [options, setOptions] = useState<ApiOptions>({
    groupBy: [],
    currencies: [],
    paymentTypes: [],
    formats: [],
  });

  // Cargar opciones al montar el componente
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setHasError(false);
        setErrorMessage('');
        
        // Cargar opciones de configuración
        const configResponse = await fetch('/api/reports/turn-concepts?action=config');
        
        if (!configResponse.ok) {
          throw new Error(`Error cargando configuración: ${configResponse.status}`);
        }
        
        const configData = await configResponse.json();
        
        // Cargar turnos disponibles
        const turnosResponse = await fetch('/api/reports/turn-concepts?action=turnos');
        
        if (!turnosResponse.ok) {
          throw new Error(`Error cargando turnos: ${turnosResponse.status}`);
        }
        
        const turnosData = await turnosResponse.json();
        
        setOptions(configData.availableOptions);
        setTurnos(turnosData.turnos);
        
      } catch (error) {
        console.error('Error cargando opciones:', error);
        const message = error instanceof Error ? error.message : "No se pudieron cargar las opciones del reporte. Verifica tu conexión e intenta nuevamente.";
        setHasError(true);
        setErrorMessage(message);
        
        toast({
          title: "Error de conexión",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast]);

  // Manejar cambios en el formulario
  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar selección múltiple
  const handleMultiSelect = (field: keyof ReportConfig, value: string, checked: boolean) => {
    setConfig(prev => {
      const currentArray = prev[field] as string[] | number[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, field === 'turnos' ? parseInt(value) : value],
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== (field === 'turnos' ? parseInt(value) : value)),
        };
      }
    });
  };

  // Generar reporte
  const generateReport = async () => {
    try {
      setIsGenerating(true);

      // Validar fechas
      if (!config.dateFrom || !config.dateTo) {
        toast({
          title: "Error de validación",
          description: "Debes seleccionar fechas válidas para el reporte",
          variant: "destructive",
        });
        return;
      }

      if (new Date(config.dateFrom) > new Date(config.dateTo)) {
        toast({
          title: "Error de validación",
          description: "La fecha inicial no puede ser mayor a la fecha final",
          variant: "destructive",
        });
        return;
      }

      // Mostrar toast de inicio
      toast({
        title: "Generando reporte",
        description: "Por favor espera mientras se procesa tu solicitud...",
      });

      const response = await fetch('/api/reports/turn-concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        let errorMessage = 'Error desconocido generando reporte';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar mensaje por defecto
          errorMessage = `Error del servidor (${response.status}): ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      if (config.format === 'PDF') {
        // Verificar el tipo de contenido
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/pdf')) {
          // Manejar PDF tradicional
          const blob = await response.blob();
          const pdfUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `reporte-conceptos-turnos-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(pdfUrl);
        } else if (contentType?.includes('text/html')) {
          // Manejar HTML que puede ser convertido a PDF por el navegador
          const htmlContent = await response.text();
          
          // Crear una nueva ventana/pestaña con el HTML
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
            
            // Mostrar diálogo de impresión automáticamente para que el usuario pueda guardar como PDF
            setTimeout(() => {
              newWindow.print();
            }, 500);
          } else {
            // Si no se puede abrir ventana, crear un blob y descargar como HTML
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const htmlUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = htmlUrl;
            link.download = `reporte-conceptos-turnos-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(htmlUrl);
          }
        } else {
          throw new Error('La respuesta del servidor no es un formato válido (PDF o HTML)');
        }

        toast({
          title: "¡Reporte generado!",
          description: "El reporte se ha generado exitosamente",
        });
      } else {
        // Mostrar datos JSON
        const data = await response.json();
        console.log('Datos del reporte:', data);
        
        toast({
          title: "¡Reporte generado!",
          description: "Los datos del reporte están disponibles en la consola del navegador",
        });
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      
      let errorMessage = "Error desconocido al generar el reporte";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error al generar reporte",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reporte de Conceptos por Turnos
          </CardTitle>
          <CardDescription>
            Cargando opciones del reporte...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error al cargar reporte
          </CardTitle>
          <CardDescription>
            Ha ocurrido un problema al cargar las opciones del reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Reporte de Conceptos por Turnos
        </CardTitle>
        <CardDescription>
          Genera reportes detallados de movimientos financieros agrupados por turnos, fechas o usuarios
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rango de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha Inicio
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={config.dateFrom}
              onChange={(e) => handleConfigChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateTo">Fecha Fin</Label>
            <Input
              id="dateTo"
              type="date"
              value={config.dateTo}
              onChange={(e) => handleConfigChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Configuración de agrupación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Agrupar Por
            </Label>
            <Select value={config.groupBy} onValueChange={(value) => handleConfigChange('groupBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar agrupación" />
              </SelectTrigger>
              <SelectContent>
                {options.groupBy.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato de Salida</Label>
            <Select value={config.format} onValueChange={(value) => handleConfigChange('format', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                {options.formats.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Selección de turnos */}
        <div className="space-y-3">
          <Label>Turnos a Incluir</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {turnos.map((turno) => (
              <div key={turno.numero} className="flex items-center space-x-2">
                <Checkbox
                  id={`turno-${turno.numero}`}
                  checked={config.turnos.includes(turno.numero)}
                  onCheckedChange={(checked) => 
                    handleMultiSelect('turnos', turno.numero.toString(), checked as boolean)
                  }
                />
                <Label htmlFor={`turno-${turno.numero}`} className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">{turno.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {turno.inicio} - {turno.fin}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
          {config.turnos.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Sin turnos seleccionados se incluirán todos</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Selección de monedas */}
        <div className="space-y-3">
          <Label>Monedas</Label>
          <div className="flex flex-wrap gap-2">
            {options.currencies.map((currency) => (
              <div key={currency.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`currency-${currency.value}`}
                  checked={config.currencies.includes(currency.value)}
                  onCheckedChange={(checked) => 
                    handleMultiSelect('currencies', currency.value, checked as boolean)
                  }
                />
                <Label htmlFor={`currency-${currency.value}`} className="cursor-pointer">
                  <Badge variant={config.currencies.includes(currency.value) ? "default" : "outline"}>
                    {currency.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Selección de tipos de pago */}
        <div className="space-y-3">
          <Label>Tipos de Pago</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.paymentTypes.map((paymentType) => (
              <div key={paymentType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-${paymentType.value}`}
                  checked={config.paymentTypes.includes(paymentType.value)}
                  onCheckedChange={(checked) => 
                    handleMultiSelect('paymentTypes', paymentType.value, checked as boolean)
                  }
                />
                <Label htmlFor={`payment-${paymentType.value}`} className="cursor-pointer">
                  {paymentType.label}
                </Label>
              </div>
            ))}
          </div>
          {config.paymentTypes.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Sin tipos seleccionados se incluirán todos</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Opciones de visualización */}
        <div className="space-y-3">
          <Label>Opciones de Visualización</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDetails"
                checked={config.includeDetails}
                onCheckedChange={(checked) => handleConfigChange('includeDetails', checked)}
              />
              <Label htmlFor="includeDetails" className="cursor-pointer">
                Incluir detalles de cada movimiento
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showTotals"
                checked={config.showTotals}
                onCheckedChange={(checked) => handleConfigChange('showTotals', checked)}
              />
              <Label htmlFor="showTotals" className="cursor-pointer">
                Mostrar totales y resúmenes
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Botón de generación */}
        <div className="flex justify-end">
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            size="lg"
            className="min-w-40"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
