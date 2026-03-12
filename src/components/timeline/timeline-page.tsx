"use client";

import {
  MapPin,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  Footprints,
  ArrowRight,
  Hotel,
  Calendar,
  ListTodo,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TRANSPORT_TYPES, BOOKING_TYPES } from "@/lib/constants";

const transportIcons: Record<string, React.ElementType> = {
  flight: Plane, train: Train, bus: Bus, car: Car, ferry: Ship, walk: Footprints,
};

interface TimelineEvent {
  date: string;
  time?: string;
  type: "city_arrival" | "city_departure" | "segment" | "booking" | "itinerary" | "task";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function TimelinePage({
  trip,
  cities,
  segments,
  itineraryItems,
  bookings,
  tasks,
}: {
  trip: { id: string; startDate: string | null; endDate: string | null };
  cities: { id: string; name: string; arrivalDate: string | null; departureDate: string | null }[];
  segments: {
    id: string;
    transportType: string;
    departureDatetime: string | null;
    arrivalDatetime: string | null;
    fromCity: { name: string } | null;
    toCity: { name: string } | null;
    provider: string | null;
  }[];
  itineraryItems: {
    id: string;
    date: string;
    startTime: string | null;
    title: string;
    city: { name: string } | null;
    status: string;
  }[];
  bookings: {
    id: string;
    type: string;
    title: string;
    startDatetime: string | null;
    city: { name: string } | null;
  }[];
  tasks: {
    id: string;
    title: string;
    dueDate: string | null;
    status: string;
  }[];
}) {
  // Build all events
  const events: TimelineEvent[] = [];

  cities.forEach((city) => {
    if (city.arrivalDate) {
      events.push({
        date: city.arrivalDate,
        type: "city_arrival",
        title: `Chegada em ${city.name}`,
        icon: MapPin,
        color: "text-green-500",
      });
    }
    if (city.departureDate) {
      events.push({
        date: city.departureDate,
        type: "city_departure",
        title: `Saída de ${city.name}`,
        icon: MapPin,
        color: "text-orange-500",
      });
    }
  });

  segments.forEach((seg) => {
    const dateStr = seg.departureDatetime?.split("T")[0];
    if (dateStr) {
      const Icon = transportIcons[seg.transportType] || ArrowRight;
      const type = TRANSPORT_TYPES.find((t) => t.value === seg.transportType);
      events.push({
        date: dateStr,
        time: seg.departureDatetime?.split("T")[1]?.slice(0, 5),
        type: "segment",
        title: `${seg.fromCity?.name || "?"} → ${seg.toCity?.name || "?"}`,
        subtitle: [type?.label, seg.provider].filter(Boolean).join(" · "),
        icon: Icon,
        color: "text-blue-500",
      });
    }
  });

  itineraryItems.forEach((item) => {
    events.push({
      date: item.date,
      time: item.startTime || undefined,
      type: "itinerary",
      title: item.title,
      subtitle: item.city?.name,
      icon: Camera,
      color: item.status === "done" ? "text-green-400" : item.status === "skipped" ? "text-gray-400" : "text-purple-400",
    });
  });

  bookings.forEach((booking) => {
    const dateStr = booking.startDatetime?.split("T")[0];
    if (dateStr) {
      const bType = BOOKING_TYPES.find((t) => t.value === booking.type);
      events.push({
        date: dateStr,
        time: booking.startDatetime?.split("T")[1]?.slice(0, 5),
        type: "booking",
        title: booking.title,
        subtitle: [bType?.label, booking.city?.name].filter(Boolean).join(" · "),
        icon: Hotel,
        color: "text-cyan-500",
      });
    }
  });

  tasks.forEach((task) => {
    if (task.dueDate) {
      events.push({
        date: task.dueDate,
        type: "task",
        title: task.title,
        subtitle: task.status === "done" ? "Concluída" : "Pendente",
        icon: ListTodo,
        color: task.status === "done" ? "text-green-400" : "text-yellow-500",
      });
    }
  });

  // Sort by date then time
  events.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  // Group by date
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Timeline da Viagem</h2>
        <Badge variant="outline" className="text-xs ml-auto">
          {events.length} eventos
        </Badge>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum evento na timeline. Adicione cidades, reservas e itinerário!
        </p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date} className="mb-6">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2 relative">
                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 ${
                  date === today ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                }`}>
                  {new Date(date + "T00:00:00").getDate()}
                </div>
                <span className={`text-sm font-medium ${date === today ? "text-primary" : "text-muted-foreground"}`}>
                  {formatDate(date)}
                  {date === today && <Badge className="ml-2 text-[10px]">Hoje</Badge>}
                </span>
              </div>

              {/* Events */}
              <div className="ml-12 space-y-1.5">
                {dayEvents.map((event, i) => (
                  <Card key={`${date}-${i}`} className="border-l-2" style={{ borderLeftColor: "var(--border)" }}>
                    <CardContent className="p-2.5 flex items-center gap-2.5">
                      <event.icon className={`h-4 w-4 shrink-0 ${event.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        {event.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>
                        )}
                      </div>
                      {event.time && (
                        <span className="text-xs text-muted-foreground shrink-0">{event.time}</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
