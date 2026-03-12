"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Calendar, Copy, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRIP_STATUSES } from "@/lib/constants";
import { createTrip, deleteTrip, duplicateTrip } from "@/app/actions/trips";

type TripWithCounts = {
  id: string;
  title: string;
  country: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
  status: string;
  notes: string | null;
  cities: { id: string; name: string }[];
  _count: {
    tasks: number;
    checklistItems: number;
    expenses: number;
  };
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function daysBetween(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function TripsListPage({ trips }: { trips: TripWithCounts[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const trip = await createTrip({
        title: formData.get("title") as string,
        country: (formData.get("country") as string) || undefined,
        startDate: (formData.get("startDate") as string) || undefined,
        endDate: (formData.get("endDate") as string) || undefined,
        baseCurrency: (formData.get("baseCurrency") as string) || "EUR",
        notes: (formData.get("notes") as string) || undefined,
      });
      setOpen(false);
      router.push(`/trips/${trip.id}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta viagem?")) return;
    await deleteTrip(id);
    router.refresh();
  }

  async function handleDuplicate(id: string) {
    const trip = await duplicateTrip(id);
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Viagens</h2>
          <p className="text-sm text-muted-foreground">
            {trips.length === 0
              ? "Nenhuma viagem ainda. Crie sua primeira!"
              : `${trips.length} viage${trips.length === 1 ? "m" : "ns"}`}
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Viagem
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Viagem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="title">Nome da viagem *</Label>
                <Input id="title" name="title" placeholder="Ex: Europa 2026" required />
              </div>
              <div>
                <Label htmlFor="country">País / Região</Label>
                <Input id="country" name="country" placeholder="Ex: Espanha" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Início</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">Fim</Label>
                  <Input id="endDate" name="endDate" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="baseCurrency">Moeda base</Label>
                <select
                  id="baseCurrency"
                  name="baseCurrency"
                  defaultValue="EUR"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="BRL">BRL - Real</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="GBP">GBP - Libra</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" rows={2} placeholder="Observações gerais..." />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar Viagem"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Crie sua primeira viagem para começar a planejar!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => {
            const status = TRIP_STATUSES.find((s) => s.value === trip.status);
            const days = daysBetween(trip.startDate, trip.endDate);

            return (
              <Card
                key={trip.id}
                className="group cursor-pointer transition-colors hover:border-primary/30"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{trip.title}</h3>
                      {trip.country && (
                        <p className="text-sm text-muted-foreground">{trip.country}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {status?.label || trip.status}
                      </Badge>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setMenuOpen(menuOpen === trip.id ? null : trip.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {menuOpen === trip.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
                              <button
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                onClick={() => { setMenuOpen(null); handleDuplicate(trip.id); }}
                              >
                                <Copy className="h-4 w-4" />
                                Duplicar
                              </button>
                              <button
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                                onClick={() => { setMenuOpen(null); handleDelete(trip.id); }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                    </span>
                    {days !== null && <span>{days} dias</span>}
                  </div>

                  {trip.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {trip.cities.map((city) => (
                        <Badge key={city.id} variant="outline" className="text-xs">
                          {city.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {trip._count.tasks > 0 && (
                      <span>{trip._count.tasks} tarefa{trip._count.tasks > 1 ? "s" : ""} pendente{trip._count.tasks > 1 ? "s" : ""}</span>
                    )}
                    {trip._count.checklistItems > 0 && (
                      <span>{trip._count.checklistItems} item{trip._count.checklistItems > 1 ? "ns" : ""} no checklist</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
