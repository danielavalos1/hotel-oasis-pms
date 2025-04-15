"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StaffStats } from "@/components/staff/staff-stats";
import { StaffFilters } from "@/components/staff/staff-filters";
import { StaffList } from "@/components/staff/staff-list";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface StaffContainerProps {
  defaultTab?: string;
}

export function StaffContainer({ defaultTab = "staff" }: StaffContainerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    departments: 0,
    pendingDocuments: 0
  });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>(defaultTab);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has admin privileges
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "ADMIN" && role !== "SUPERADMIN") {
        router.push("/dashboard");
        return;
      }

      // Fetch data
      Promise.all([
        fetchStaffStats(),
        fetchStaff(),
        fetchDepartments(),
      ]).finally(() => setLoading(false));
      
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, session]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchStaffStats(),
        fetchStaff(),
      ]);
      toast.success("Datos actualizados correctamente");
    } catch (err) {
      toast.error("Error al actualizar los datos");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchStaffStats = async () => {
    try {
      const response = await fetch("/api/staff/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch staff statistics");
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar estadísticas del personal");
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      const data = await response.json();
      setStaffList(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar personal");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/staff/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data);
    } catch (err: any) {
      console.error("Error fetching departments:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        <StaffStats stats={stats} isLoading={true} />
        <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
        <div className="h-96 w-full bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={refreshData} disabled={refreshing}>
            {refreshing ? "Intentando nuevamente..." : "Intentar nuevamente"}
          </Button>
        </div>
      </div>
    );
  }

  // Filter staff based on filters
  const filteredStaff = staffList.filter((staff) => {
    const matchesStatus =
      filterStatus === "all" || staff.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" ||
      (staff.departmentId &&
        staff.departmentId.toString() === filterDepartment);
    const matchesSearch =
      searchQuery === "" ||
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.lastName &&
        staff.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const handleStaffAdded = async () => {
    await Promise.all([fetchStaffStats(), fetchStaff()]);
    toast.success("Empleado añadido exitosamente");
  };

  const handleStaffUpdated = async () => {
    await Promise.all([fetchStaffStats(), fetchStaff()]);
    toast.success("Empleado actualizado exitosamente");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <StaffStats stats={stats} />
      
      <Separator className="my-6" />
      
      <StaffFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        departments={departments}
        onRefresh={refreshData}
        isRefreshing={refreshing}
      />
      
      <StaffList 
        staffList={filteredStaff}
        departments={departments}
        onStaffAdded={handleStaffAdded}
        onStaffUpdated={handleStaffUpdated}
      />
    </div>
  );
}