"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Hotel,
  Plane,
  Train,
  Bus,
  Car,
  Ticket,
  UtensilsCrossed,
  Shield,
  MoreHorizontal,
  Calendar,
  MapPin,
  CreditCard,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BOOKING_TYPES } from "@/lib/constants";
import {
  createBooking,
  updateBooking,
  deleteBooking,
} from "@/app/actions/bookings";

// --- Types ---

interface City {
  id: string;
  name: string;
  country: string | null;
}

interface Booking {
  id: string;
  tripId: string;
  cityId: string | null;
  type: string;
  title: string;
  provider: string | null;
  bookingCode: string | null;
  startDatetime: string | null;
  endDatetime: string | null;
  address: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  paymentStatus: string;
  notes: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  city: City | null;
}

interface Trip {
  id: string;
  title: string;
}

// --- Helpers ---

const typeIcons: Record<string, React.ElementType> = {
  accommodation: Hotel,
  flight: Plane,
  train: Train,
  bus: Bus,
  car_rental: Car,
  ticket: Ticket,
  restaurant: UtensilsCrossed,
  insurance: Shield,
  other: MoreHorizontal,
};

const paymentStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  paid: { label: "Pago", className: "bg-green-500/15 text-green-600 dark:text-green-400" },
  pending: { label: "Pendente", className: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
  cancelled: { label: "Cancelado", className: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

function formatDatetime(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatPrice(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return null;
  const cur = currency || "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur }).format(amount);
  } catch {
    return `${cur} ${amount.toFixed(2)}`;
  }
}

function getTypeLabel(type: string) {
  return BOOKING_TYPES.find((t) => t.value === type)?.label || type;
}

// --- Component ---

export function BookingsPage({
  trip,
  bookings,
  cities,
}: {
  trip: Trip;
  bookings: Booking[];
  cities: City[];
}) {
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [viewing, setViewing] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Filter bookings
  const filtered = bookings.filter((b) => {
    if (activeTab !== "all" && b.type !== activeTab) return false;
    if (filterCity && b.cityId !== filterCity) return false;
    if (filterStatus && b.paymentStatus !== filterStatus) return false;
    return true;
  });

  // Count per type for tabs
  const countByType = (type: string) =>
    bookings.filter((b) => b.type === type).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        cityId: (fd.get("cityId") as string) || undefined,
        type: (fd.get("type") as string) || "other",
        title: fd.get("title") as string,
        provider: (fd.get("provider") as string) || undefined,
        bookingCode: (fd.get("bookingCode") as string) || undefined,
        startDatetime: (fd.get("startDatetime") as string) || undefined,
        endDatetime: (fd.get("endDatetime") as string) || undefined,
        address: (fd.get("address") as string) || undefined,
        priceAmount: fd.get("priceAmount")
          ? Number(fd.get("priceAmount"))
          : undefined,
        priceCurrency: (fd.get("priceCurrency") as string) || undefined,
        paymentStatus: (fd.get("paymentStatus") as string) || "pending",
        notes: (fd.get("notes") as string) || undefined,
        attachmentUrl: (fd.get("attachmentUrl") as string) || undefined,
        externalUrl: (fd.get("externalUrl") as string) || undefined,
      };

      if (editing) {
        await updateBooking(editing.id, data);
      } else {
        await createBooking({ tripId: trip.id, ...data });
      }
      setFormDialogOpen(false);
      setEditing(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormDialogOpen(true);
  }

  function openEdit(booking: Booking) {
    setEditing(booking);
    setFormDialogOpen(true);
  }

  function openDetail(booking: Booking) {
    setViewing(booking);
    setDetailDialogOpen(true);
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Reservas ({bookings.length})
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            <option value="">Todas as cidades</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="">Todos os status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Tabs by type */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">
            Todos ({bookings.length})
          </TabsTrigger>
          {BOOKING_TYPES.map((bt) => {
            const count = countByType(bt.value);
            if (count === 0) return null;
            return (
              <TabsTrigger
                key={bt.value}
                value={bt.value}
                className="text-xs"
              >
                {bt.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab}>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma reserva encontrada.
            </p>
          ) : (
            <div className="space-y-3 mt-3">
              {filtered.map((booking) => {
                const Icon = typeIcons[booking.type] || MoreHorizontal;
                const status = paymentStatusConfig[booking.paymentStatus];
                const price = formatPrice(
                  booking.priceAmount,
                  booking.priceCurrency
                );

                return (
                  <Card
                    key={booking.id}
                    className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => openDetail(booking)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm truncate">
                              {booking.title}
                            </p>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {getTypeLabel(booking.type)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                            {booking.provider && (
                              <span>{booking.provider}</span>
                            )}
                            {booking.startDatetime && (
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDateShort(booking.startDatetime)}
                                {booking.endDatetime &&
                                  ` - ${formatDateShort(booking.endDatetime)}`}
                              </span>
                            )}
                            {booking.city && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {booking.city.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {price && (
                            <span className="text-sm font-semibold flex items-center gap-0.5">
                              <CreditCard className="h-3 w-3 text-muted-foreground" />
                              {price}
                            </span>
                          )}
                          {status && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.className}`}
                            >
                              {status.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onOpenChange={(o) => {
          setDetailDialogOpen(o);
          if (!o) setViewing(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{getTypeLabel(viewing.type)}</Badge>
                {paymentStatusConfig[viewing.paymentStatus] && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusConfig[viewing.paymentStatus].className}`}
                  >
                    {paymentStatusConfig[viewing.paymentStatus].label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {viewing.provider && (
                  <div>
                    <p className="text-muted-foreground text-xs">Provedor</p>
                    <p className="font-medium">{viewing.provider}</p>
                  </div>
                )}
                {viewing.bookingCode && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Cod. Reserva
                    </p>
                    <p className="font-medium">{viewing.bookingCode}</p>
                  </div>
                )}
                {viewing.city && (
                  <div>
                    <p className="text-muted-foreground text-xs">Cidade</p>
                    <p className="font-medium">{viewing.city.name}</p>
                  </div>
                )}
                {viewing.startDatetime && (
                  <div>
                    <p className="text-muted-foreground text-xs">Inicio</p>
                    <p className="font-medium">
                      {formatDatetime(viewing.startDatetime)}
                    </p>
                  </div>
                )}
                {viewing.endDatetime && (
                  <div>
                    <p className="text-muted-foreground text-xs">Fim</p>
                    <p className="font-medium">
                      {formatDatetime(viewing.endDatetime)}
                    </p>
                  </div>
                )}
                {viewing.priceAmount != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Valor</p>
                    <p className="font-medium">
                      {formatPrice(viewing.priceAmount, viewing.priceCurrency)}
                    </p>
                  </div>
                )}
              </div>

              {viewing.address && (
                <div>
                  <p className="text-muted-foreground text-xs">Endereco</p>
                  <p>{viewing.address}</p>
                </div>
              )}

              {viewing.notes && (
                <div>
                  <p className="text-muted-foreground text-xs">Notas</p>
                  <p className="whitespace-pre-wrap">{viewing.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {viewing.externalUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(viewing.externalUrl!, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Abrir link
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openEdit(viewing);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={async () => {
                    if (confirm(`Excluir "${viewing.title}"?`)) {
                      await deleteBooking(viewing.id);
                      setDetailDialogOpen(false);
                      setViewing(null);
                      router.refresh();
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={formDialogOpen}
        onOpenChange={(o) => {
          setFormDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Reserva" : "Nova Reserva"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editing?.title || ""}
                placeholder="Ex: Hotel Central Madrid"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={editing?.type || "other"}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {BOOKING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Status Pagamento</Label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  defaultValue={editing?.paymentStatus || "pending"}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {cities.length > 0 && (
              <div>
                <Label htmlFor="cityId">Cidade</Label>
                <select
                  id="cityId"
                  name="cityId"
                  defaultValue={editing?.cityId || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
              <Label htmlFor="provider">Provedor / Companhia</Label>
              <Input
                id="provider"
                name="provider"
                defaultValue={editing?.provider || ""}
                placeholder="Ex: Booking.com, Latam"
              />
            </div>

            <div>
              <Label htmlFor="bookingCode">Codigo da Reserva</Label>
              <Input
                id="bookingCode"
                name="bookingCode"
                defaultValue={editing?.bookingCode || ""}
                placeholder="Ex: ABC123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDatetime">Data Inicio</Label>
                <Input
                  id="startDatetime"
                  name="startDatetime"
                  type="datetime-local"
                  defaultValue={editing?.startDatetime?.slice(0, 16) || ""}
                />
              </div>
              <div>
                <Label htmlFor="endDatetime">Data Fim</Label>
                <Input
                  id="endDatetime"
                  name="endDatetime"
                  type="datetime-local"
                  defaultValue={editing?.endDatetime?.slice(0, 16) || ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                name="address"
                defaultValue={editing?.address || ""}
                placeholder="Ex: Calle Gran Via 10, Madrid"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceAmount">Valor</Label>
                <Input
                  id="priceAmount"
                  name="priceAmount"
                  type="number"
                  step="0.01"
                  defaultValue={editing?.priceAmount ?? ""}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="priceCurrency">Moeda</Label>
                <Input
                  id="priceCurrency"
                  name="priceCurrency"
                  defaultValue={editing?.priceCurrency || "BRL"}
                  placeholder="BRL, EUR, USD"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="externalUrl">Link Externo</Label>
              <Input
                id="externalUrl"
                name="externalUrl"
                type="url"
                defaultValue={editing?.externalUrl || ""}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="attachmentUrl">URL do Anexo</Label>
              <Input
                id="attachmentUrl"
                name="attachmentUrl"
                type="url"
                defaultValue={editing?.attachmentUrl || ""}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={editing?.notes || ""}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editing ? "Salvar" : "Criar Reserva"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
