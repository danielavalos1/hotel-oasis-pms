"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomsList } from "./rooms-list";
import { RoomGrid } from "./room-grid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewRoomForm } from "./new-room-form-enhanced";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { AdminOnlyMessage } from "@/components/ui/admin-only-message";

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const { session } = useAuth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Habitaciones</h2>
        </div>
        
        {isAdmin && (
          <Dialog open={isNewRoomOpen} onOpenChange={setIsNewRoomOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Habitación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Añadir Nueva Habitación</DialogTitle>
              </DialogHeader>
              <NewRoomForm onSuccess={() => setIsNewRoomOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAdmin && (
        <AdminOnlyMessage 
          feature="La gestión de habitaciones (crear, editar, eliminar)" 
          className="mb-6"
        />
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 w-full">
        <div className="relative flex-1 min-w-0 max-w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar habitación por número o características..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto overflow-x-auto">
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-[110px] min-w-[90px]">
              <SelectValue placeholder="Piso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="1">Piso 1</SelectItem>
              <SelectItem value="2">Piso 2</SelectItem>
              <SelectItem value="3">Piso 3</SelectItem>
              <SelectItem value="4">Piso 4</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] min-w-[110px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="standard">Estándar</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="presidential">Presidencial</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setFloorFilter("all");
              setTypeFilter("all");
              setSearchQuery("");
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <Card className="transition-all hover:shadow-md overflow-x-auto">
        <CardHeader className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <CardTitle className="text-lg">Habitaciones del Hotel</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-[180px]">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-0 p-0">
              <RoomsList
                searchQuery={searchQuery}
                floorFilter={floorFilter}
                typeFilter={typeFilter}
              />
            </TabsContent>
            <TabsContent value="grid" className="mt-0">
              <RoomGrid
                searchQuery={searchQuery}
                floorFilter={floorFilter}
                typeFilter={typeFilter}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
