"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import {
  Building2,
  LogOut,
  CalendarDays,
  Users,
  Home,
  CreditCard,
  Activity,
  ShoppingBag,
  Globe,
  PenTool as Tool,
  Star,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/channels", label: "Channels", icon: Globe },
  { href: "/dashboard/rates", label: "Rates", icon: CreditCard },
  { href: "/dashboard/inventory", label: "Inventory", icon: ShoppingBag },
  { href: "/dashboard/rooms", label: "Rooms", icon: Home },
  { href: "/dashboard/amenities", label: "Amenities", icon: Star },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Tool },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/users", label: "Personal", icon: Users },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-open sidebar on desktop after mount
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "bg-muted border-r flex flex-col fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200",
          isSidebarOpen ? "translate-x-0 md:translate-x-0" : "-translate-x-full md:-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Hotel Oasis PMS</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                className={cn(
                  "flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground transition",
                  isActive && "bg-accent text-accent-foreground"
                )}
                key={item.href}
                href={item.href}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center p-2 rounded hover:bg-accent hover:text-accent-foreground transition"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      <main
        className={cn(
          "flex-1 p-6 overflow-auto transition-all duration-200",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="hidden md:inline-flex p-2"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
