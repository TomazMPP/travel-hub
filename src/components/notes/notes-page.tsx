"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Pin,
  MapPin,
  StickyNote,
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
import {
  createNote,
  updateNote,
  deleteNote,
  toggleNotePin,
} from "@/app/actions/notes";

// --- Types ---

interface City {
  id: string;
  name: string;
  country: string | null;
}

interface Note {
  id: string;
  tripId: string;
  cityId: string | null;
  title: string;
  content: string | null;
  tags: string | null;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  city: { name: string } | null;
}

interface Trip {
  id: string;
  title: string;
}

// --- Component ---

export function NotesPage({
  trip,
  notes,
  cities,
}: {
  trip: Trip;
  notes: Note[];
  cities: City[];
}) {
  const router = useRouter();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("");

  // Filter notes
  const filtered = notes.filter((n) => {
    if (filterCity && n.cityId !== filterCity) return false;
    return true;
  });

  // Sort: pinned first, then by updatedAt desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  function parseTags(tags: string | null): string[] {
    if (!tags) return [];
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function truncateContent(content: string | null, maxLen = 100): string {
    if (!content) return "";
    if (content.length <= maxLen) return content;
    return content.slice(0, maxLen) + "...";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        title: fd.get("title") as string,
        content: (fd.get("content") as string) || undefined,
        tags: (fd.get("tags") as string) || undefined,
        cityId: (fd.get("cityId") as string) || undefined,
        pinned: fd.get("pinned") === "on",
      };

      if (editing) {
        await updateNote(editing.id, {
          ...data,
          cityId: data.cityId || null,
        });
      } else {
        await createNote({ tripId: trip.id, ...data });
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

  function openEdit(note: Note) {
    setEditing(note);
    setFormDialogOpen(true);
  }

  async function handleTogglePin(note: Note) {
    await toggleNotePin(note.id);
    router.refresh();
  }

  async function handleDelete(note: Note) {
    if (confirm(`Excluir nota "${note.title}"?`)) {
      await deleteNote(note.id);
      router.refresh();
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Notas ({notes.length})
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
      </div>

      {/* Notes grid */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhuma nota encontrada.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((note) => {
            const tags = parseTags(note.tags);
            return (
              <Card
                key={note.id}
                className="hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
                      <StickyNote className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate flex-1">
                          {note.title}
                        </p>
                        {note.pinned && (
                          <Pin className="h-3.5 w-3.5 text-primary shrink-0 fill-primary" />
                        )}
                      </div>

                      {note.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                          {truncateContent(note.content)}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.city && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {note.city.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleTogglePin(note)}
                      title={note.pinned ? "Desafixar" : "Fixar"}
                    >
                      <Pin
                        className={`h-3.5 w-3.5 ${
                          note.pinned
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(note)}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => handleDelete(note)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
              {editing ? "Editar Nota" : "Nova Nota"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editing?.title || ""}
                placeholder="Ex: Dicas do hotel"
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                rows={8}
                defaultValue={editing?.content || ""}
                placeholder="Escreva sua nota aqui..."
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={editing?.tags || ""}
                placeholder="Ex: dica, hotel, comida"
              />
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                name="pinned"
                defaultChecked={editing?.pinned || false}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="pinned" className="text-sm font-normal">
                Fixar no topo
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editing ? "Salvar" : "Criar Nota"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
