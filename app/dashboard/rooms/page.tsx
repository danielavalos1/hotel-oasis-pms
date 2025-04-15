"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomsList } from "./rooms-list";
import { RoomGrid } from "./room-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewRoomForm } from "./new-room-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Habitaciones</h2>
        
        <Dialog open={isNewRoomOpen} onOpenChange={setIsNewRoomOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Habitación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Habitación</DialogTitle>
            </DialogHeader>
            <NewRoomForm onSuccess={() => setIsNewRoomOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar habitación por número o características..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-[130px]">
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
            <SelectTrigger className="w-[160px]">
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

          <Button variant="ghost" size="sm" onClick={() => {
            setFloorFilter("all");
            setTypeFilter("all");
            setSearchQuery("");
          }}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Habitaciones del Hotel</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="grid grid-cols-2 w-[180px]">
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </div>
  );
}