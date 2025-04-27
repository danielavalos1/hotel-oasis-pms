"use client";

import { useState } from "react";
import {
  Activity,
  CalendarDays,
  Users,
  Home,
  CreditCard,
  LogOut,
  ShoppingBag,
  Building2,
  Globe,
  PenTool as Tool,
  Star,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, label, icon, active, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
      active
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground"
    )}
  >
    {icon}
    {label}
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      href: "/dashboard/bookings",
      label: "Bookings",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      href: "/dashboard/channels",
      label: "Channels",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      href: "/dashboard/rates",
      label: "Rates",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      href: "/dashboard/inventory",
      label: "Inventory",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      href: "/dashboard/rooms",
      label: "Rooms",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/dashboard/amenities",
      label: "Amenities",
      icon: <Star className="h-4 w-4" />,
    },
    {
      href: "/dashboard/maintenance",
      label: "Maintenance",
      icon: <Tool className="h-4 w-4" />,
    },
    {
      href: "/dashboard/guests",
      label: "Guests",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      href: "/dashboard/staff",
      label: "Staff",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-4">
          <Building2 className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-semibold">Hotel Oasis</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
        </nav>
        <div className="border-t p-4 space-y-2">
          {user && (
            <div className="px-2 pb-2 flex items-center gap-2">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header for mobile and desktop */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 sm:max-w-xs">
                  <div className="flex h-16 items-center border-b">
                    <Building2 className="h-6 w-6 text-primary mr-2" />
                    <span className="text-lg font-semibold">Hotel Oasis</span>
                  </div>
                  <nav className="flex flex-col gap-1 py-4">
                    {navItems.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={pathname === item.href}
                        onClick={closeMobileMenu}
                      />
                    ))}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard" className="flex items-center lg:hidden">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="ml-2 text-lg font-semibold">Hotel Oasis</span>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-end space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="container py-6 px-4 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
