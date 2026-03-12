"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Link2,
  MapPin,
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
import { LINK_CATEGORIES } from "@/lib/constants";
import {
  createLink,
  updateLink,
  deleteLink,
} from "@/app/actions/links";

// --- Types ---

interface City {
  id: string;
  name: string;
  country: string | null;
}

interface UsefulLink {
  id: string;
  tripId: string;
  cityId: string | null;
  title: string;
  url: string;
  category: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  city: { name: string } | null;
}

interface Trip {
  id: string;
  title: string;
}

// --- Helpers ---

function getCategoryLabel(category: string | null) {
  if (!category) return null;
  return LINK_CATEGORIES.find((c) => c.value === category)?.label || category;
}

// --- Component ---

export function LinksPage({
  trip,
  links,
  cities,
}: {
  trip: Trip;
  links: UsefulLink[];
  cities: City[];
}) {
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UsefulLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Filter links
  const filtered = links.filter((l) => {
    if (filterCity && l.cityId !== filterCity) return false;
    if (filterCategory && l.category !== filterCategory) return false;
    return true;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, UsefulLink[]>>((acc, link) => {
    const cat = link.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {});

  // Sort categories by LINK_CATEGORIES order
  const categoryOrder = LINK_CATEGORIES.map((c) => c.value);
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a as typeof categoryOrder[number]) - categoryOrder.indexOf(b as typeof categoryOrder[number])
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        title: fd.get("title") as string,
        url: fd.get("url") as string,
        category: (fd.get("category") as string) || undefined,
        cityId: (fd.get("cityId") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      };

      if (editing) {
        await updateLink(editing.id, {
          ...data,
          cityId: data.cityId || null,
        });
      } else {
        await createLink({ tripId: trip.id, ...data });
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

  function openEdit(link: UsefulLink) {
    setEditing(link);
    setFormDialogOpen(true);
  }

  async function handleDelete(link: UsefulLink) {
    if (confirm(`Excluir link "${link.title}"?`)) {
      await deleteLink(link.id);
      router.refresh();
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Links Úteis ({links.length})
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="">Todas as categorias</option>
          {LINK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Links grouped by category */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum link encontrado.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {getCategoryLabel(cat) || cat}
              </h3>
              <div className="space-y-3">
                {grouped[cat].map((link) => (
                  <Card
                    key={link.id}
                    className="hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm truncate hover:text-primary hover:underline flex items-center gap-1"
                            >
                              {link.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            {link.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] shrink-0"
                              >
                                {getCategoryLabel(link.category)}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                            {link.city && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {link.city.name}
                              </span>
                            )}
                            {link.notes && (
                              <span className="truncate">{link.notes}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEdit(link)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => handleDelete(link)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
              {editing ? "Editar Link" : "Novo Link"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editing?.title || ""}
                placeholder="Ex: Google Maps - Roma"
              />
            </div>

            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                name="url"
                type="url"
                required
                defaultValue={editing?.url || ""}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editing?.category || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {LINK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
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
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={editing?.notes || ""}
                placeholder="Notas sobre este link..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editing ? "Salvar" : "Criar Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
