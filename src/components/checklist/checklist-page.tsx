"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckCircle2, Circle, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CHECKLIST_CATEGORIES } from "@/lib/constants";
import {
  createChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  applyChecklistTemplate,
} from "@/app/actions/checklist";

interface ChecklistItem {
  id: string;
  tripId: string;
  category: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  sortOrder: number;
}

const TEMPLATES = [
  { value: "international", label: "Viagem Internacional" },
  { value: "one_month", label: "Viagem de 1 mês" },
  { value: "with_laptop", label: "Com Notebook" },
  { value: "car_rental", label: "Com Aluguel de Carro" },
];

export function ChecklistPage({ tripId, items }: { tripId: string; items: ChecklistItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState("");
  const [quickAddCategory, setQuickAddCategory] = useState("other");
  const [loading, setLoading] = useState(false);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  // Group by category
  const grouped = filtered.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.isCompleted).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAdd.trim()) return;
    setLoading(true);
    await createChecklistItem({
      tripId,
      category: quickAddCategory,
      title: quickAdd.trim(),
    });
    setQuickAdd("");
    setLoading(false);
    router.refresh();
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await createChecklistItem({
      tripId,
      category: fd.get("category") as string,
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      dueDate: (fd.get("dueDate") as string) || undefined,
    });
    setAddDialogOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleToggle(id: string) {
    await toggleChecklistItem(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteChecklistItem(id);
    router.refresh();
  }

  async function handleApplyTemplate(template: string) {
    setLoading(true);
    await applyChecklistTemplate(tripId, template);
    setTemplateDialogOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              <span className="font-semibold">Progresso</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <select
          value={quickAddCategory}
          onChange={(e) => setQuickAddCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm w-32 shrink-0"
        >
          {CHECKLIST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <Input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          placeholder="Adicionar item rápido..."
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading || !quickAdd.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Detalhado
        </Button>
        <Button variant="outline" size="sm" onClick={() => setTemplateDialogOpen(true)}>
          <ListChecks className="h-4 w-4 mr-1" />
          Templates
        </Button>
        <div className="ml-auto" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="all">Todas categorias</option>
          {CHECKLIST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Grouped Items */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum item. Adicione itens ou aplique um template!
        </p>
      ) : (
        Object.entries(grouped).map(([category, categoryItems]) => {
          const cat = CHECKLIST_CATEGORIES.find((c) => c.value === category);
          const catCompleted = categoryItems.filter((i) => i.isCompleted).length;
          const catProgress = Math.round((catCompleted / categoryItems.length) * 100);

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{cat?.label || category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {catCompleted}/{categoryItems.length}
                </span>
                <Progress value={catProgress} className="h-1 flex-1 max-w-20" />
              </div>
              <div className="space-y-1.5">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 group rounded-md px-2.5 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <button onClick={() => handleToggle(item.id)} className="shrink-0">
                      {item.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {item.title}
                    </span>
                    {item.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.dueDate + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select id="category" name="category" defaultValue="other"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                {CHECKLIST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dueDate">Data limite</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Os itens do template serão adicionados à sua checklist existente.
            </p>
            {TEMPLATES.map((t) => (
              <Button
                key={t.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleApplyTemplate(t.value)}
                disabled={loading}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
