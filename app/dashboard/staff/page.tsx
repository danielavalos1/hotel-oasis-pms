"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  Clock,
  FileBox,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffContainer } from "@/components/staff/staff-container";
import { StaffTabLayout } from "@/components/staff/staff-tab-layout";
import { AttendanceManager } from "@/components/staff/attendance-manager";
import { ScheduleManager } from "@/components/staff/schedule-manager";
import { DocumentManager } from "@/components/staff/document-manager";
import { DepartmentManager } from "@/components/staff/department-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function StaffManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("staff");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Navegación con query params para preservar la pestaña activa durante refrescos
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/staff?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
          <p className="text-muted-foreground mt-1">
            Administre el personal, horarios, asistencia y documentos
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full md:w-auto">
              <UserPlus className="h-4 w-4" />
              Registrar Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Empleado</DialogTitle>
              <DialogDescription>Complete el formulario para registrar un nuevo empleado.</DialogDescription>
            </DialogHeader>
            {/* El formulario se manejará en el componente StaffList */}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="staff" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex h-12 items-center space-x-2 overflow-x-auto bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileBox className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffContainer />
        </TabsContent>

        <TabsContent value="attendance">
          <StaffTabLayout 
            title="Control de Asistencia" 
            description="Registre y monitoree la asistencia del personal"
          >
            <AttendanceManager />
          </StaffTabLayout>
        </TabsContent>

        <TabsContent value="schedules">
          <StaffTabLayout 
            title="Administración de Horarios" 
            description="Cree y gestione los horarios del personal"
          >
            <ScheduleManager />
          </StaffTabLayout>
        </TabsContent>

        <TabsContent value="documents">
          <StaffTabLayout 
            title="Documentos del Personal" 
            description="Gestione los documentos y certificaciones del personal"
          >
            <DocumentManager />
          </StaffTabLayout>
        </TabsContent>

        <TabsContent value="departments">
          <StaffTabLayout 
            title="Departamentos" 
            description="Gestione los departamentos de la empresa"
          >
            <DepartmentManager />
          </StaffTabLayout>
        </TabsContent>
      </Tabs>
    </div>
  );
}