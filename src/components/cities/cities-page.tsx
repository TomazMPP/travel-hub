"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  ArrowRight,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  Footprints,
  AlertTriangle,
} from "lucide-react";
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
import { TRANSPORT_TYPES } from "@/lib/constants";
import { createCity, updateCity, deleteCity, reorderCities } from "@/app/actions/cities";
import { createSegment, updateSegment, deleteSegment } from "@/app/actions/segments";

const transportIcons: Record<string, React.ElementType> = {
  flight: Plane, train: Train, bus: Bus, car: Car, ferry: Ship, walk: Footprints,
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function nightsBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

interface City {
  id: string;
  tripId: string;
  name: string;
  country: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  plannedNights: number | null;
  notes: string | null;
  sortOrder: number;
}

interface Segment {
  id: string;
  tripId: string;
  fromCityId: string | null;
  toCityId: string | null;
  transportType: string;
  departureDatetime: string | null;
  arrivalDatetime: string | null;
  bookingReference: string | null;
  provider: string | null;
  seatInfo: string | null;
  notes: string | null;
  fromCity: { name: string } | null;
  toCity: { name: string } | null;
}

interface Trip {
  id: string;
  title: string;
}

export function CitiesPage({ trip, cities, segments }: { trip: Trip; cities: City[]; segments: Segment[] }) {
  const router = useRouter();
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Gap/overlap detection
  const warnings: string[] = [];
  for (let i = 0; i < cities.length - 1; i++) {
    const curr = cities[i];
    const next = cities[i + 1];
    if (curr.departureDate && next.arrivalDate) {
      const dep = new Date(curr.departureDate);
      const arr = new Date(next.arrivalDate);
      const diff = (arr.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 1) {
        warnings.push(`Gap de ${Math.floor(diff)} dias entre ${curr.name} e ${next.name}`);
      } else if (diff < 0) {
        warnings.push(`Sobreposição entre ${curr.name} e ${next.name}`);
      }
    }
  }

  async function handleCitySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (editingCity) {
        await updateCity(editingCity.id, {
          name: fd.get("name") as string,
          country: (fd.get("country") as string) || undefined,
          arrivalDate: (fd.get("arrivalDate") as string) || undefined,
          departureDate: (fd.get("departureDate") as string) || undefined,
          plannedNights: fd.get("plannedNights") ? Number(fd.get("plannedNights")) : undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
      } else {
        await createCity({
          tripId: trip.id,
          name: fd.get("name") as string,
          country: (fd.get("country") as string) || undefined,
          arrivalDate: (fd.get("arrivalDate") as string) || undefined,
          departureDate: (fd.get("departureDate") as string) || undefined,
          plannedNights: fd.get("plannedNights") ? Number(fd.get("plannedNights")) : undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
      }
      setCityDialogOpen(false);
      setEditingCity(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSegmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        fromCityId: (fd.get("fromCityId") as string) || undefined,
        toCityId: (fd.get("toCityId") as string) || undefined,
        transportType: (fd.get("transportType") as string) || "other",
        departureDatetime: (fd.get("departureDatetime") as string) || undefined,
        arrivalDatetime: (fd.get("arrivalDatetime") as string) || undefined,
        bookingReference: (fd.get("bookingReference") as string) || undefined,
        provider: (fd.get("provider") as string) || undefined,
        seatInfo: (fd.get("seatInfo") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      };

      if (editingSegment) {
        await updateSegment(editingSegment.id, data);
      } else {
        await createSegment({ tripId: trip.id, ...data });
      }
      setSegmentDialogOpen(false);
      setEditingSegment(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
  }

  async function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const ids = cities.map((c) => c.id);
    const draggedIndex = ids.indexOf(draggedId);
    const targetIndex = ids.indexOf(targetId);
    ids.splice(draggedIndex, 1);
    ids.splice(targetIndex, 0, draggedId);
    setDraggedId(null);
    await reorderCities(trip.id, ids);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 rounded-md p-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Cities Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Cidades ({cities.length})</h2>
          <Button
            size="sm"
            onClick={() => { setEditingCity(null); setCityDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {cities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma cidade adicionada ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {cities.map((city, i) => {
              const nights = nightsBetween(city.arrivalDate, city.departureDate);
              return (
                <div key={city.id}>
                  <Card
                    draggable
                    onDragStart={() => handleDragStart(city.id)}
                    onDragOver={(e) => handleDragOver(e, city.id)}
                    onDrop={() => handleDrop(city.id)}
                    className={`transition-opacity ${draggedId === city.id ? "opacity-50" : ""}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{city.name}</p>
                          {city.country && (
                            <span className="text-xs text-muted-foreground">{city.country}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{formatDate(city.arrivalDate)} → {formatDate(city.departureDate)}</span>
                          {nights !== null && <Badge variant="outline" className="text-xs">{nights} noites</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => { setEditingCity(city); setCityDialogOpen(true); }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={async () => {
                            if (confirm(`Excluir ${city.name}?`)) {
                              await deleteCity(city.id);
                              router.refresh();
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Segment arrow between cities */}
                  {i < cities.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      {(() => {
                        const seg = segments.find(
                          (s) => s.fromCityId === city.id && s.toCityId === cities[i + 1]?.id
                        );
                        if (seg) {
                          const Icon = transportIcons[seg.transportType] || ArrowRight;
                          return (
                            <button
                              onClick={() => { setEditingSegment(seg); setSegmentDialogOpen(true); }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {seg.provider && <span>{seg.provider}</span>}
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={() => {
                              setEditingSegment(null);
                              setSegmentDialogOpen(true);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline visualization */}
      {segments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Trechos ({segments.length})</h2>
          <div className="space-y-2">
            {segments.map((seg) => {
              const Icon = transportIcons[seg.transportType] || ArrowRight;
              const type = TRANSPORT_TYPES.find((t) => t.value === seg.transportType);
              return (
                <Card key={seg.id} className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => { setEditingSegment(seg); setSegmentDialogOpen(true); }}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {seg.fromCity?.name || "?"} → {seg.toCity?.name || "?"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{type?.label}</Badge>
                        {seg.provider && <span>{seg.provider}</span>}
                        {seg.bookingReference && <span>Ref: {seg.bookingReference}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {seg.departureDatetime && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(seg.departureDatetime).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive shrink-0"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm("Excluir trecho?")) {
                          await deleteSegment(seg.id);
                          router.refresh();
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => { setEditingSegment(null); setSegmentDialogOpen(true); }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Trecho
      </Button>

      {/* City Dialog */}
      <Dialog open={cityDialogOpen} onOpenChange={(o) => { setCityDialogOpen(o); if (!o) setEditingCity(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCity ? "Editar Cidade" : "Adicionar Cidade"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCitySubmit} className="space-y-3">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" defaultValue={editingCity?.name} required placeholder="Ex: Madrid" />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" defaultValue={editingCity?.country || ""} placeholder="Ex: Espanha" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="arrivalDate">Chegada</Label>
                <Input id="arrivalDate" name="arrivalDate" type="date" defaultValue={editingCity?.arrivalDate || ""} />
              </div>
              <div>
                <Label htmlFor="departureDate">Saída</Label>
                <Input id="departureDate" name="departureDate" type="date" defaultValue={editingCity?.departureDate || ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="plannedNights">Noites planejadas</Label>
              <Input id="plannedNights" name="plannedNights" type="number" defaultValue={editingCity?.plannedNights || ""} />
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={editingCity?.notes || ""} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editingCity ? "Salvar" : "Adicionar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Segment Dialog */}
      <Dialog open={segmentDialogOpen} onOpenChange={(o) => { setSegmentDialogOpen(o); if (!o) setEditingSegment(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSegment ? "Editar Trecho" : "Novo Trecho"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSegmentSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fromCityId">De</Label>
                <select id="fromCityId" name="fromCityId" defaultValue={editingSegment?.fromCityId || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="toCityId">Para</Label>
                <select id="toCityId" name="toCityId" defaultValue={editingSegment?.toCityId || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="transportType">Tipo de transporte</Label>
              <select id="transportType" name="transportType" defaultValue={editingSegment?.transportType || "flight"}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                {TRANSPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="departureDatetime">Partida</Label>
                <Input id="departureDatetime" name="departureDatetime" type="datetime-local"
                  defaultValue={editingSegment?.departureDatetime?.slice(0, 16) || ""} />
              </div>
              <div>
                <Label htmlFor="arrivalDatetime">Chegada</Label>
                <Input id="arrivalDatetime" name="arrivalDatetime" type="datetime-local"
                  defaultValue={editingSegment?.arrivalDatetime?.slice(0, 16) || ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="provider">Companhia/Provedor</Label>
                <Input id="provider" name="provider" defaultValue={editingSegment?.provider || ""} placeholder="Ex: Renfe" />
              </div>
              <div>
                <Label htmlFor="bookingReference">Ref. da reserva</Label>
                <Input id="bookingReference" name="bookingReference" defaultValue={editingSegment?.bookingReference || ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="seatInfo">Assento</Label>
              <Input id="seatInfo" name="seatInfo" defaultValue={editingSegment?.seatInfo || ""} />
            </div>
            <div>
              <Label htmlFor="seg-notes">Notas</Label>
              <Textarea id="seg-notes" name="notes" rows={2} defaultValue={editingSegment?.notes || ""} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editingSegment ? "Salvar" : "Criar Trecho"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
