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
  ChevronLeft,
  ChevronRight,
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
  collapsed?: boolean;
}

const NavItem = ({
  href,
  label,
  icon,
  active,
  onClick,
  collapsed = false,
}: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center text-sm transition-all hover:bg-accent",
      collapsed ? "justify-center p-2" : "gap-3 rounded-lg px-3 py-2",
      active
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground"
    )}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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

  // Filtrar enlaces según rol
  const allowedNav = () => {
    const role = user?.role;
    if (role === "ADMIN" || role === "SUPERADMIN") return navItems;
    if (role === "RECEPTIONIST")
      return navItems.filter((item) =>
        [
          "/dashboard",
          "/dashboard/bookings",
          "/dashboard/guests",
          "/dashboard/payments",
        ].includes(item.href)
      );
    if (role === "HOUSEKEEPER")
      return navItems.filter((item) =>
        [
          "/dashboard/inventory",
          "/dashboard/rooms",
          "/dashboard/maintenance",
        ].includes(item.href)
      );
    return [];
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-background transition-all duration-200 z-30",
          collapsed ? "w-16" : "w-64",
          "h-full fixed lg:static left-0 top-0"
        )}
        style={{ minHeight: "100dvh" }}
      >
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {!collapsed && (
                <span className="text-xl font-semibold">Hotel Oasis</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {/* Enlaces filtrados por rol */}
          {allowedNav().map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>
        {/* Sidebar no muestra datos del usuario ni logout; se manejan en header */}
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header for mobile and desktop */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-2 sm:px-4 md:px-6 max-w-full w-full mx-auto">
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
                    {allowedNav().map((item) => (
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
              {user && (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Cerrar sesión</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="w-full max-w-screen-xl mx-auto py-4 px-2 sm:px-4 md:px-6 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
