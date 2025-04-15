"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  className?: string;
  initialDateFrom?: Date;
  initialDateTo?: Date;
  onUpdate?: (range: DateRange | undefined) => void;
  align?: "center" | "start" | "end";
  showCompare?: boolean;
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = "center",
  showCompare = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDateFrom,
    to: initialDateTo,
  });

  // Presets para selección rápida de fechas comunes
  const presets = [
    {
      label: "Hoy",
      dateRange: {
        from: new Date(),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Ayer",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
      } as DateRange,
    },
    {
      label: "Últimos 7 días",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 6)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Últimos 30 días",
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 29)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Este mes",
      dateRange: {
        from: new Date(new Date().setDate(1)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Mes pasado",
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      } as DateRange,
    },
  ];

  // Opciones para comparar periodos
  const compareOptions = [
    { label: "Período anterior", value: "previous_period" },
    { label: "Mismo período del año pasado", value: "previous_year" },
  ];

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<
    string | undefined
  >(undefined);
  const [compareMode, setCompareMode] = React.useState<string | undefined>(
    undefined
  );

  // Actualizar el rango cuando cambian las propiedades iniciales
  React.useEffect(() => {
    if (initialDateFrom || initialDateTo) {
      setDate({
        from: initialDateFrom,
        to: initialDateTo,
      });
    }
  }, [initialDateFrom, initialDateTo]);

  // Manejar cambios en el rango de fechas
  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setSelectedPreset(undefined);
    if (onUpdate) {
      onUpdate(range);
    }
  };

  // Manejar selección de presets
  const handlePresetChange = (preset: (typeof presets)[number]) => {
    setDate(preset.dateRange);
    setSelectedPreset(preset.label);
    if (onUpdate) {
      onUpdate(preset.dateRange);
    }
  };

  // Formatear rango para mostrar en el botón
  const formatDateRange = () => {
    if (!date?.from) {
      return "Seleccionar fecha";
    }

    if (date.to) {
      return `${format(date.from, "d MMM, yyyy", { locale: es })} - ${format(
        date.to,
        "d MMM, yyyy",
        { locale: es }
      )}`;
    }

    return format(date.from, "d MMM, yyyy", { locale: es });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto flex" align={align}>
          <div className="flex flex-col gap-2 p-2">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 pr-2 sm:w-48">
                  <div className="flex flex-col">
                    <h4 className="font-medium text-sm pb-2">Presets</h4>
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={
                          selectedPreset === preset.label ? "default" : "ghost"
                        }
                        className="justify-start font-normal"
                        onClick={() => handlePresetChange(preset)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  {showCompare && (
                    <div className="flex flex-col border-t pt-2 mt-2">
                      <h4 className="font-medium text-sm pb-2">Comparar con</h4>
                      <Select
                        value={compareMode}
                        onValueChange={(value) => setCompareMode(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar comparación" />
                        </SelectTrigger>
                        <SelectContent>
                          {compareOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="border-l pl-2">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateChange}
                    numberOfMonths={2}
                    locale={es}
                    showOutsideDays={false}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 py-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDate(undefined);
                  setSelectedPreset(undefined);
                  setIsOpen(false);
                  if (onUpdate) {
                    onUpdate(undefined);
                  }
                }}
              >
                Limpiar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  if (onUpdate) {
                    onUpdate(date);
                  }
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
