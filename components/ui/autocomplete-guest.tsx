import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Loader2, Search, User } from "lucide-react";

export interface GuestOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface AutocompleteGuestProps {
  value: GuestOption | null;
  onChange: (guest: GuestOption | null) => void;
  onInputChange: (input: string) => void;
  inputValue: string;
  isLoading?: boolean;
  results: GuestOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function AutocompleteGuest({
  value,
  onChange,
  onInputChange,
  inputValue,
  isLoading = false,
  results = [],
  disabled = false,
  placeholder = "Buscar huésped por nombre o email"
}: AutocompleteGuestProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar el popover si no hay resultados y no está cargando
  useEffect(() => {
    if (!isLoading && results.length === 0 && !inputValue) {
      setOpen(false);
    }
  }, [isLoading, results, inputValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
    if (e.target.value.trim()) {
      setOpen(true);
    }
  };

  const handleSelect = (guest: GuestOption) => {
    onChange(guest);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    onInputChange("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInput}
              disabled={disabled}
              autoComplete="off"
              className="pl-8"
              onClick={() => inputValue && setOpen(true)}
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <span className="sr-only">Limpiar</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[320px] max-h-60 overflow-auto" align="start">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Buscando huéspedes...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((guest) => (
                <li
                  key={guest.id}
                  className={cn(
                    "flex flex-col px-3 py-2 cursor-pointer hover:bg-muted transition-colors",
                    value?.id === guest.id && "bg-muted"
                  )}
                  onClick={() => handleSelect(guest)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">{guest.email}</div>
                  {guest.phoneNumber && (
                    <div className="text-xs text-muted-foreground ml-6">{guest.phoneNumber}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : inputValue ? (
            <div className="p-4 text-sm text-center border-t">
              <p className="text-muted-foreground">No se encontraron huéspedes</p>
              <p className="text-xs mt-1">La búsqueda usa nombre, apellido y email</p>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
