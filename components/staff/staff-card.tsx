"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";

// Definición de tipos
type Department = {
  id: number;
  name: string;
};

type Staff = {
  id: number;
  username: string;
  name: string;
  lastName?: string | null;
  email: string;
  status: string;
  role: string;
  position?: string | null;
  hireDate?: string | null;
  department?: Department | null;
  departmentId?: number | null;
};

type StatusVariant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "success";

const statusMapping: Record<string, { label: string; variant: StatusVariant }> =
  {
    ACTIVE: { label: "Activo", variant: "success" },
    INACTIVE: { label: "Inactivo", variant: "destructive" },
    SUSPENDED: { label: "Suspendido", variant: "secondary" },
    ON_LEAVE: { label: "De permiso", variant: "outline" },
  };

const roleMapping: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuario",
  STAFF: "Staff",
  SUPERADMIN: "Super Admin",
  RECEPTIONIST: "Recepcionista",
  HOUSEKEEPING: "Limpieza",
  MAINTENANCE: "Mantenimiento",
};

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onViewDetails: (staffId: number) => void;
  onMoreOptions: (staff: Staff) => void;
  isCompact?: boolean;
}

export function StaffCard({ 
  staff, 
  onEdit, 
  onViewDetails, 
  onMoreOptions,
  isCompact = false
}: StaffCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={`transition-all duration-200 ${isHovered ? 'shadow-md' : ''} ${isCompact ? 'p-3' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className={`${isCompact ? 'p-0' : 'p-6'}`}>
        <div className="flex items-center gap-4">
          <Avatar className={isCompact ? "h-10 w-10" : "h-16 w-16"}>
            <AvatarFallback className="text-lg">
              {staff.name.charAt(0)}
              {staff.lastName?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="font-medium text-lg">
                  {staff.name} {staff.lastName || ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {roleMapping[staff.role] || staff.role}
                  {staff.position && ` - ${staff.position}`}
                </p>
              </div>
              
              <Badge variant={statusMapping[staff.status]?.variant || "secondary"}>
                {statusMapping[staff.status]?.label || staff.status}
              </Badge>
            </div>
            
            {!isCompact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm break-all">{staff.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Departamento</p>
                  <p className="text-sm">{staff.department?.name || "—"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className={`flex justify-end gap-2 ${isCompact ? 'p-0 pt-3' : ''}`}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(staff.id)}
        >
          <FileText className="h-4 w-4 mr-1" />
          <span className={isCompact ? "sr-only" : ""}>Detalles</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(staff)}
        >
          <Edit className="h-4 w-4 mr-1" />
          <span className={isCompact ? "sr-only" : ""}>Editar</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onMoreOptions(staff)}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Opciones</span>
        </Button>
      </CardFooter>
    </Card>
  );
}