import { Info, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminOnlyMessageProps {
  feature: string;
  className?: string;
}

export function AdminOnlyMessage({ feature, className }: AdminOnlyMessageProps) {
  return (
    <Alert className={`border-amber-200 bg-amber-50 text-amber-800 ${className}`}>
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          {feature} solo está disponible para administradores. 
          Contacta al administrador del sistema para realizar modificaciones.
        </span>
      </AlertDescription>
    </Alert>
  );
}
