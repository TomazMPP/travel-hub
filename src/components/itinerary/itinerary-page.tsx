"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Trash2,
  Edit2,
  Copy,
  Camera,
  UtensilsCrossed,
  Landmark,
  Footprints,
  ShoppingBag,
  FileText,
  Coffee,
  Train,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ITINERARY_CATEGORIES } from "@/lib/constants";
import {
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  duplicateItineraryItem,
} from "@/app/actions/itinerary";

// ── Icon map ──────────────────────────────────────────────────
const categoryIcons: Record<string, React.ElementType> = {
  tour: Camera,
  food: UtensilsCrossed,
  museum: Landmark,
  walk: Footprints,
  shopping: ShoppingBag,
  admin: FileText,
  rest: Coffee,
  transport: Train,
  other: MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  tour: "bg-violet-100 text-violet-700",
  food: "bg-orange-100 text-orange-700",
  museum: "bg-amber-100 text-amber-700",
  walk: "bg-green-100 text-green-700",
  shopping: "bg-pink-100 text-pink-700",
  admin: "bg-slate-100 text-slate-700",
  rest: "bg-sky-100 text-sky-700",
  transport: "bg-blue-100 text-blue-700",
  other: "bg-gray-100 text-gray-700",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejado", color: "bg-blue-100 text-blue-700" },
  done: { label: "Feito", color: "bg-green-100 text-green-700" },
  skipped: { label: "Pulado", color: "bg-gray-100 text-gray-500" },
};

// ── Helpers ───────────────────────────────────────────────────
function formatDatePt(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function getCategoryLabel(value: string) {
  return ITINERARY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// ── Types ─────────────────────────────────────────────────────
interface City {
  id: string;
  name: string;
  country: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
}

interface ItineraryItem {
  id: string;
  tripId: string;
  cityId: string | null;
  date: string;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  locationName: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  category: string;
  status: string;
  sortOrder: number;
  city: { id: string; name: string } | null;
}

interface Trip {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  cityId: string;
  locationName: string;
  address: string;
  googleMapsUrl: string;
  category: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  cityId: "",
  locationName: "",
  address: "",
  googleMapsUrl: "",
  category: "other",
};

// ── Main Component ────────────────────────────────────────────
export function ItineraryPage({
  trip,
  cities,
  items: initialItems,
}: {
  trip: Trip;
  cities: City[];
  items: ItineraryItem[];
}) {
  const router = useRouter();
  const today = toISODate(new Date());
  const defaultDate = trip.startDate ?? today;

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [filterCity, setFilterCity] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [duplicatingItem, setDuplicatingItem] = useState<ItineraryItem | null>(null);
  const [duplicateDate, setDuplicateDate] = useState("");
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Filter items for selected date + optional city filter
  const dayItems = useMemo(() => {
    return initialItems
      .filter((item) => item.date === selectedDate)
      .filter((item) => !filterCity || item.cityId === filterCity);
  }, [initialItems, selectedDate, filterCity]);

  const timedItems = useMemo(
    () => dayItems.filter((i) => i.startTime).sort((a, b) => (a.startTime! < b.startTime! ? -1 : 1)),
    [dayItems]
  );

  const untimedItems = useMemo(
    () => dayItems.filter((i) => !i.startTime),
    [dayItems]
  );

  // All unique dates that have items
  const allDates = useMemo(() => {
    const set = new Set(initialItems.map((i) => i.date));
    return Array.from(set).sort();
  }, [initialItems]);

  // ── Handlers ──────────────────────────────────────────────
  function openCreate() {
    setEditingItem(null);
    setForm({ ...emptyForm, date: selectedDate });
    setDialogOpen(true);
  }

  function openEdit(item: ItineraryItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      date: item.date,
      startTime: item.startTime ?? "",
      endTime: item.endTime ?? "",
      cityId: item.cityId ?? "",
      locationName: item.locationName ?? "",
      address: item.address ?? "",
      googleMapsUrl: item.googleMapsUrl ?? "",
      category: item.category,
    });
    setDialogOpen(true);
  }

  function openDuplicate(item: ItineraryItem) {
    setDuplicatingItem(item);
    setDuplicateDate(addDays(item.date, 1));
    setDuplicateDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      const payload = {
        tripId: trip.id,
        cityId: form.cityId || null,
        date: form.date,
        title: form.title.trim(),
        description: form.description || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        locationName: form.locationName || undefined,
        address: form.address || undefined,
        googleMapsUrl: form.googleMapsUrl || undefined,
        category: form.category,
      };

      if (editingItem) {
        const { tripId, ...updatePayload } = payload;
        await updateItineraryItem(editingItem.id, updatePayload);
      } else {
        await createItineraryItem(payload);
      }

      setDialogOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteItineraryItem(id);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    await updateItineraryItem(id, { status });
    router.refresh();
  }

  async function handleDuplicate() {
    if (!duplicatingItem || !duplicateDate) return;
    setSaving(true);
    try {
      await duplicateItineraryItem(duplicatingItem.id, duplicateDate);
      setDuplicateDialogOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-center"
          />
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(today)}
        >
          Hoje
        </Button>
      </div>

      {/* Date label */}
      <p className="text-sm text-muted-foreground capitalize text-center">
        {formatDatePt(selectedDate)}
      </p>

      {/* Dates with items - quick jump */}
      {allDates.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {allDates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                d === selectedDate
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {formatDateShort(d)}
            </button>
          ))}
        </div>
      )}

      {/* City filter */}
      {cities.length > 0 && (
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.country ? ` — ${c.country}` : ""}
            </option>
          ))}
        </select>
      )}

      {/* Timed items */}
      {timedItems.length > 0 && (
        <div className="space-y-2">
          {timedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onDuplicate={openDuplicate}
            />
          ))}
        </div>
      )}

      {/* Untimed items */}
      {untimedItems.length > 0 && (
        <div className="space-y-2">
          {timedItems.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
              Sem horário definido
            </p>
          )}
          {untimedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onDuplicate={openDuplicate}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {dayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Calendar className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Nenhuma atividade neste dia</p>
          <p className="text-xs mt-1">Adicione itens ao roteiro</p>
        </div>
      )}

      {/* Add button */}
      <Button onClick={openCreate} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Adicionar atividade
      </Button>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Atividade" : "Nova Atividade"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="itinerary-title">Título *</Label>
              <Input
                id="itinerary-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Visitar o Coliseu"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="itinerary-date">Data *</Label>
                <Input
                  id="itinerary-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="itinerary-category">Categoria</Label>
                <select
                  id="itinerary-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {ITINERARY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="itinerary-start">Início</Label>
                <Input
                  id="itinerary-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="itinerary-end">Fim</Label>
                <Input
                  id="itinerary-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            {cities.length > 0 && (
              <div>
                <Label htmlFor="itinerary-city">Cidade</Label>
                <select
                  id="itinerary-city"
                  value={form.cityId}
                  onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Nenhuma</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="itinerary-location">Local</Label>
              <Input
                id="itinerary-location"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                placeholder="Nome do local"
              />
            </div>

            <div>
              <Label htmlFor="itinerary-address">Endereço</Label>
              <Input
                id="itinerary-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>

            <div>
              <Label htmlFor="itinerary-maps">Link Google Maps</Label>
              <Input
                id="itinerary-maps"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <Label htmlFor="itinerary-desc">Descrição / Notas</Label>
              <Textarea
                id="itinerary-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Detalhes, dicas, observações..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? "Salvando..." : editingItem ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Duplicar Atividade</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Duplicar &ldquo;{duplicatingItem?.title}&rdquo; para outro dia:
          </p>
          <div>
            <Label htmlFor="duplicate-date">Nova data</Label>
            <Input
              id="duplicate-date"
              type="date"
              value={duplicateDate}
              onChange={(e) => setDuplicateDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={saving || !duplicateDate}>
              {saving ? "Duplicando..." : "Duplicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Item Card ─────────────────────────────────────────────────
function ItemCard({
  item,
  onEdit,
  onDelete,
  onStatusChange,
  onDuplicate,
}: {
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDuplicate: (item: ItineraryItem) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = categoryIcons[item.category] ?? MoreHorizontal;
  const catColor = categoryColors[item.category] ?? categoryColors.other;
  const stCfg = statusConfig[item.status] ?? statusConfig.planned;
  const isDone = item.status === "done";
  const isSkipped = item.status === "skipped";

  return (
    <Card
      size="sm"
      className={`relative transition-opacity ${isSkipped ? "opacity-50" : ""}`}
    >
      <CardContent className="flex gap-3">
        {/* Category icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${catColor}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-tight ${
                isDone ? "line-through text-muted-foreground" : ""
              }`}
            >
              {item.title}
            </p>
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-50 w-40 rounded-lg border bg-popover p-1 shadow-md">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(item);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(item);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicar
                    </button>
                    <hr className="my-1 border-border" />
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(item.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {item.startTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.startTime}
                {item.endTime ? ` — ${item.endTime}` : ""}
              </span>
            )}
            {item.locationName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.locationName}
              </span>
            )}
            {item.city && (
              <span className="text-xs">{item.city.name}</span>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Badges & actions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}
            >
              {getCategoryLabel(item.category)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${stCfg.color}`}
            >
              {stCfg.label}
            </span>

            {item.googleMapsUrl && (
              <a
                href={item.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <ExternalLink className="h-2.5 w-2.5" /> Maps
              </a>
            )}

            {/* Quick status actions */}
            <div className="ml-auto flex gap-1">
              {item.status !== "done" && (
                <button
                  onClick={() => onStatusChange(item.id, "done")}
                  className="rounded-md p-1 text-green-600 hover:bg-green-50"
                  title="Marcar como feito"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              {item.status !== "skipped" && (
                <button
                  onClick={() => onStatusChange(item.id, "skipped")}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
                  title="Marcar como pulado"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {item.status !== "planned" && (
                <button
                  onClick={() => onStatusChange(item.id, "planned")}
                  className="rounded-md p-1 text-blue-500 hover:bg-blue-50"
                  title="Voltar para planejado"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
