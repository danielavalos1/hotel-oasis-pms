"use client";

import { Input } from "@/components/ui/input";
import { Search, RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Department {
  id: number;
  name: string;
}

interface StaffFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDepartment: string;
  setFilterDepartment: (value: string) => void;
  departments: Department[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function StaffFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDepartment,
  setFilterDepartment,
  departments,
  onRefresh,
  isRefreshing = false,
}: StaffFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex gap-2 items-center grow">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="w-full"
          placeholder="Buscar por nombre, email, usuario..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="INACTIVE">Inactivo</SelectItem>
            <SelectItem value="SUSPENDED">Suspendido</SelectItem>
            <SelectItem value="ON_LEAVE">De permiso</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full md:w-[190px]">
            <SelectValue placeholder="Filtrar por departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id.toString()}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onRefresh} 
          disabled={isRefreshing}
          title="Actualizar datos"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}