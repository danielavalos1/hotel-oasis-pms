"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StaffTabLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function StaffTabLayout({ title, description, children }: StaffTabLayoutProps) {
  return (
    <Card className="animate-in fade-in">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}