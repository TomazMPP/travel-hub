"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Star,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  User,
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
import { CONTACT_TYPES } from "@/lib/constants";
import {
  createContact,
  updateContact,
  deleteContact,
  toggleContactFavorite,
} from "@/app/actions/contacts";

// --- Types ---

interface City {
  id: string;
  name: string;
  country: string | null;
}

interface Contact {
  id: string;
  tripId: string;
  cityId: string | null;
  name: string;
  type: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  city: { name: string } | null;
}

interface Trip {
  id: string;
  title: string;
}

// --- Helpers ---

function getTypeLabel(type: string | null) {
  if (!type) return null;
  return CONTACT_TYPES.find((t) => t.value === type)?.label || type;
}

// --- Component ---

export function ContactsPage({
  trip,
  contacts,
  cities,
}: {
  trip: Trip;
  contacts: Contact[];
  cities: City[];
}) {
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");

  // Filter contacts
  const filtered = contacts.filter((c) => {
    if (filterCity && c.cityId !== filterCity) return false;
    if (filterType && c.type !== filterType) return false;
    return true;
  });

  // Sort: favorites first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        name: fd.get("name") as string,
        type: (fd.get("type") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        whatsapp: (fd.get("whatsapp") as string) || undefined,
        email: (fd.get("email") as string) || undefined,
        address: (fd.get("address") as string) || undefined,
        cityId: (fd.get("cityId") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
        isFavorite: fd.get("isFavorite") === "on",
      };

      if (editing) {
        await updateContact(editing.id, {
          ...data,
          cityId: data.cityId || null,
        });
      } else {
        await createContact({ tripId: trip.id, ...data });
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

  function openEdit(contact: Contact) {
    setEditing(contact);
    setFormDialogOpen(true);
  }

  async function handleToggleFavorite(contact: Contact) {
    await toggleContactFavorite(contact.id);
    router.refresh();
  }

  async function handleDelete(contact: Contact) {
    if (confirm(`Excluir contato "${contact.name}"?`)) {
      await deleteContact(contact.id);
      router.refresh();
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Contatos ({contacts.length})
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="">Todos os tipos</option>
          {CONTACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Contact list */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum contato encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((contact) => (
            <Card key={contact.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">
                        {contact.name}
                      </p>
                      {contact.type && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {getTypeLabel(contact.type)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-0.5 hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.whatsapp && (
                        <a
                          href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 hover:text-green-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle className="h-3 w-3" />
                          {contact.whatsapp}
                        </a>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-0.5 hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      )}
                      {contact.city && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {contact.city.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggleFavorite(contact)}
                      title={contact.isFavorite ? "Remover favorito" : "Favoritar"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          contact.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(contact)}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => handleDelete(contact)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              {editing ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name || ""}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={editing?.type || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {CONTACT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
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
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={editing?.phone || ""}
                placeholder="Ex: +55 11 99999-0000"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={editing?.whatsapp || ""}
                placeholder="Ex: +55 11 99999-0000"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={editing?.email || ""}
                placeholder="Ex: contato@email.com"
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                defaultValue={editing?.address || ""}
                placeholder="Ex: Rua Principal 123, Centro"
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={editing?.notes || ""}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFavorite"
                name="isFavorite"
                defaultChecked={editing?.isFavorite || false}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isFavorite" className="text-sm font-normal">
                Marcar como favorito
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editing ? "Salvar" : "Criar Contato"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
