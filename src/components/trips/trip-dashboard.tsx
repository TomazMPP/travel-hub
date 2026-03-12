"use client";

import Link from "next/link";
import {
  MapPin,
  Calendar,
  ArrowRight,
  ListTodo,
  CheckSquare,
  Hotel,
  FileText,
  DollarSign,
  StickyNote,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  Footprints,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TRIP_STATUSES, TASK_PRIORITIES, BOOKING_TYPES } from "@/lib/constants";

const transportIcons: Record<string, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  ferry: Ship,
  walk: Footprints,
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function daysBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

interface TripDashboardProps {
  trip: {
    id: string;
    title: string;
    country: string | null;
    startDate: string | null;
    endDate: string | null;
    baseCurrency: string;
    status: string;
    notes: string | null;
    cities: {
      id: string;
      name: string;
      country: string | null;
      arrivalDate: string | null;
      departureDate: string | null;
      sortOrder: number;
    }[];
  };
  data: {
    cities: { id: string; name: string; arrivalDate: string | null; departureDate: string | null }[];
    nextSegment: {
      id: string;
      transportType: string;
      departureDatetime: string | null;
      arrivalDatetime: string | null;
      fromCity: { name: string } | null;
      toCity: { name: string } | null;
    } | null;
    pendingTasks: { id: string; title: string; priority: string; dueDate: string | null }[];
    pendingChecklist: number;
    totalChecklistItems: number;
    upcomingBookings: {
      id: string;
      title: string;
      type: string;
      startDatetime: string | null;
      city: { name: string } | null;
    }[];
    totalExpenses: number;
    plannedBudget: number;
    criticalDocuments: { id: string; title: string; documentType: string; expiresAt: string | null }[];
    pinnedNotes: { id: string; title: string; content: string | null }[];
  };
}

export function TripDashboard({ trip, data }: TripDashboardProps) {
  const status = TRIP_STATUSES.find((s) => s.value === trip.status);
  const days = daysBetween(trip.startDate, trip.endDate);
  const checklistProgress =
    data.totalChecklistItems > 0
      ? Math.round(((data.totalChecklistItems - data.pendingChecklist) / data.totalChecklistItems) * 100)
      : 0;

  // Find current/next city based on today
  const today = new Date().toISOString().split("T")[0];
  const currentCity = trip.cities.find(
    (c) => c.arrivalDate && c.departureDate && c.arrivalDate <= today && c.departureDate >= today
  );
  const nextCity = trip.cities.find((c) => c.arrivalDate && c.arrivalDate > today);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Trip Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{trip.title}</h2>
            <Badge variant="secondary">{status?.label}</Badge>
          </div>
          {trip.country && (
            <p className="text-sm text-muted-foreground mb-1">{trip.country}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </span>
            {days && <span>{days} dias</span>}
          </div>
        </div>
      </div>

      {/* Quick Info Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current/Next City */}
        <Link href={`/trips/${trip.id}/cities`}>
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <MapPin className="h-3.5 w-3.5" />
                {currentCity ? "Cidade atual" : "Próxima cidade"}
              </div>
              <p className="font-semibold text-sm truncate">
                {currentCity?.name || nextCity?.name || "—"}
              </p>
              {(currentCity || nextCity) && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(currentCity?.arrivalDate || nextCity?.arrivalDate)}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Pending Tasks */}
        <Link href={`/trips/${trip.id}/tasks`}>
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <ListTodo className="h-3.5 w-3.5" />
                Tarefas pendentes
              </div>
              <p className="font-semibold text-sm">{data.pendingTasks.length}</p>
            </CardContent>
          </Card>
        </Link>

        {/* Checklist Progress */}
        <Link href={`/trips/${trip.id}/checklist`}>
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CheckSquare className="h-3.5 w-3.5" />
                Checklist
              </div>
              <p className="font-semibold text-sm mb-1">{checklistProgress}%</p>
              <Progress value={checklistProgress} className="h-1.5" />
            </CardContent>
          </Card>
        </Link>

        {/* Budget */}
        <Link href={`/trips/${trip.id}/finances`}>
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Gastos
              </div>
              <p className="font-semibold text-sm">
                {trip.baseCurrency} {data.totalExpenses.toFixed(0)}
              </p>
              {data.plannedBudget > 0 && (
                <p className="text-xs text-muted-foreground">
                  de {trip.baseCurrency} {data.plannedBudget.toFixed(0)} planejados
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Next Segment */}
      {data.nextSegment && (
        <Link href={`/trips/${trip.id}/cities`}>
          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              {(() => {
                const Icon = transportIcons[data.nextSegment!.transportType] || ArrowRight;
                return <Icon className="h-5 w-5 text-muted-foreground shrink-0" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Próximo deslocamento</p>
                <p className="font-medium text-sm truncate">
                  {data.nextSegment.fromCity?.name || "?"} → {data.nextSegment.toCity?.name || "?"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(data.nextSegment.departureDatetime)}
              </p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Cities Route */}
      {trip.cities.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Rota
              </h3>
              <Link
                href={`/trips/${trip.id}/cities`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todas →
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {trip.cities.map((city, i) => (
                <span key={city.id} className="flex items-center gap-1">
                  <Badge
                    variant={city.id === currentCity?.id ? "default" : "outline"}
                    className="text-xs"
                  >
                    {city.name}
                  </Badge>
                  {i < trip.cities.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Pending Tasks */}
        {data.pendingTasks.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  Tarefas
                </h3>
                <Link
                  href={`/trips/${trip.id}/tasks`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-2.5">
                {data.pendingTasks.map((task) => {
                  const priority = TASK_PRIORITIES.find((p) => p.value === task.priority);
                  return (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <div className={`h-2 w-2 rounded-full ${priority?.color || "bg-gray-400"}`} />
                      <span className="flex-1 truncate">{task.title}</span>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Bookings */}
        {data.upcomingBookings.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Hotel className="h-4 w-4" />
                  Próximas reservas
                </h3>
                <Link
                  href={`/trips/${trip.id}/bookings`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-2.5">
                {data.upcomingBookings.map((booking) => {
                  const type = BOOKING_TYPES.find((t) => t.value === booking.type);
                  return (
                    <div key={booking.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {type?.label || booking.type}
                      </Badge>
                      <span className="flex-1 truncate">{booking.title}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(booking.startDatetime)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Documents */}
        {data.criticalDocuments.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos críticos
                </h3>
                <Link
                  href={`/trips/${trip.id}/documents`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-2.5">
                {data.criticalDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{doc.title}</span>
                    {doc.expiresAt && (
                      <span className="text-xs text-muted-foreground">
                        Exp: {formatDate(doc.expiresAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pinned Notes */}
        {data.pinnedNotes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Notas fixadas
                </h3>
                <Link
                  href={`/trips/${trip.id}/notes`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="space-y-2.5">
                {data.pinnedNotes.map((note) => (
                  <div key={note.id} className="text-sm">
                    <p className="font-medium truncate">{note.title}</p>
                    {note.content && (
                      <p className="text-xs text-muted-foreground truncate">
                        {note.content.substring(0, 100)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
