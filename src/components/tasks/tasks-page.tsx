"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
  ClipboardList,
  CalendarDays,
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
import { TASK_PRIORITIES, TASK_CATEGORIES } from "@/lib/constants";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "@/app/actions/tasks";

interface Task {
  id: string;
  tripId: string;
  cityId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  category: string | null;
  city: { name: string } | null;
}

interface City {
  id: string;
  name: string;
}

const PRIORITY_ORDER: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

const PRIORITY_DOT_COLORS: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em progresso" },
  { value: "done", label: "Concluída" },
];

export function TasksPage({
  tripId,
  tasks,
  cities,
}: {
  tripId: string;
  tasks: Task[];
  cities: City[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter((t) => t.category === categoryFilter);
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);

    return [...result].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 0;
      const pb = PRIORITY_ORDER[b.priority] ?? 0;
      if (pa !== pb) return pb - pa;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks, statusFilter, categoryFilter, priorityFilter]);

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAdd.trim()) return;
    setLoading(true);
    await createTask({
      tripId,
      title: quickAdd.trim(),
      priority: "medium",
      category: "personal",
    });
    setQuickAdd("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggle(id: string) {
    await toggleTaskStatus(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await deleteTask(id);
    setDeleteConfirmId(null);
    setLoading(false);
    router.refresh();
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      dueDate: (fd.get("dueDate") as string) || undefined,
      priority: fd.get("priority") as string,
      category: fd.get("category") as string,
      cityId: (fd.get("cityId") as string) || undefined,
    };

    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask({ ...data, tripId });
    }
    setDialogOpen(false);
    setEditingTask(null);
    setLoading(false);
    router.refresh();
  }

  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      {/* Header stats */}
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5" />
        <span className="font-semibold">Tarefas</span>
        <span className="text-sm text-muted-foreground ml-auto">
          {doneCount}/{tasks.length} concluídas
        </span>
      </div>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          placeholder="Adicionar tarefa rápida..."
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading || !quickAdd.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Filters + Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Detalhada
        </Button>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            <option value="all">Todas categorias</option>
            {TASK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            <option value="all">Todas prioridades</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma tarefa encontrada. Adicione sua primeira tarefa!
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const isDone = task.status === "done";
            const cat = TASK_CATEGORIES.find((c) => c.value === task.category);
            const dotColor = PRIORITY_DOT_COLORS[task.priority] ?? "bg-gray-400";

            return (
              <Card key={task.id} className={isDone ? "opacity-60" : ""}>
                <CardContent className="p-3 flex items-start gap-3">
                  <button onClick={() => handleToggle(task.id)} className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                      <span
                        className={`text-sm font-medium truncate ${isDone ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cat && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {cat.label}
                        </Badge>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      )}
                      {task.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {task.city.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(task)} className="p-1 hover:bg-accent rounded">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(task.id)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={editingTask?.title ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editingTask?.description ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dueDate">Data limite</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={editingTask?.dueDate ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue={editingTask?.priority ?? "medium"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingTask?.category ?? "personal"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="cityId">Cidade</Label>
                <select
                  id="cityId"
                  name="cityId"
                  defaultValue={editingTask?.cityId ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">Nenhuma</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editingTask ? "Salvar" : "Criar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
