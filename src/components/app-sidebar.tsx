"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Calendar,
  Hotel,
  FileText,
  CheckSquare,
  Luggage,
  DollarSign,
  Users,
  StickyNote,
  Link2,
  ListTodo,
  Clock,
  Star,
  Settings,
  Search,
  Plane,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AppSidebarProps {
  tripId?: string;
  tripTitle?: string;
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ tripId, tripTitle, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { href: "/", label: "Viagens", icon: Plane },
  ];

  const tripLinks = tripId
    ? [
        { href: `/trips/${tripId}`, label: "Dashboard", icon: LayoutDashboard },
        { href: `/trips/${tripId}/cities`, label: "Cidades & Rota", icon: MapPin },
        { href: `/trips/${tripId}/timeline`, label: "Timeline", icon: Clock },
        { href: `/trips/${tripId}/itinerary`, label: "Itinerário", icon: Calendar },
        { href: `/trips/${tripId}/bookings`, label: "Reservas", icon: Hotel },
        { href: `/trips/${tripId}/documents`, label: "Documentos", icon: FileText },
        { href: `/trips/${tripId}/checklist`, label: "Checklist", icon: CheckSquare },
        { href: `/trips/${tripId}/packing`, label: "Bagagem", icon: Luggage },
        { href: `/trips/${tripId}/finances`, label: "Financeiro", icon: DollarSign },
        { href: `/trips/${tripId}/tasks`, label: "Tarefas", icon: ListTodo },
        { href: `/trips/${tripId}/contacts`, label: "Contatos", icon: Users },
        { href: `/trips/${tripId}/notes`, label: "Notas", icon: StickyNote },
        { href: `/trips/${tripId}/links`, label: "Links", icon: Link2 },
        { href: `/trips/${tripId}/reviews`, label: "Avaliações", icon: Star },
        { href: `/trips/${tripId}/settings`, label: "Configurações", icon: Settings },
      ]
    : [];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:relative lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <Map className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Travel Hub</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {tripId && (
              <>
                <Separator className="my-2" />
                {tripTitle && (
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                    {tripTitle}
                  </p>
                )}
                {tripLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </ScrollArea>

        <Separator />
        <div className="p-3">
          <Link
            href={tripId ? `/trips/${tripId}/search` : "/"}
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Link>
        </div>
      </aside>
    </>
  );
}
