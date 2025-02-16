"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

type Guest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
};

type ApiResponse = {
  success: boolean;
  data: Guest[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GuestsList() {
  const { data, error, isLoading } = useSWR<ApiResponse>("/api/guests", fetcher);

  if (error) return <div>Error loading guests</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Guests</h2>
        <Button>Add Guest</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>{`${guest.firstName} ${guest.lastName}`}</TableCell>
              <TableCell>{guest.email}</TableCell>
              <TableCell>{guest.phoneNumber}</TableCell>
              <TableCell>{guest.address || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}