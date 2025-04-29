"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuestsList } from "@/components/dashboard/guests-list";
import { NewGuestForm } from "./new-guest-form";

export default function GuestsPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Huéspedes</h2>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center w-full sm:w-auto">
              Nuevo Huésped
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Nuevo Huésped</DialogTitle>
            </DialogHeader>
            <NewGuestForm onSuccess={() => setIsNewOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative flex-1 min-w-0 max-w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar huésped por nombre o email..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="transition-all hover:shadow-md overflow-x-auto">
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-lg">Lista de Huéspedes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <GuestsList searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  );
}