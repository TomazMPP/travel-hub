"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckCircle2, Circle, Luggage, AlertCircle, Package } from "lucide-react";
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
import { BAG_TYPES, PACKING_CATEGORIES } from "@/lib/constants";
import { createPackingItem, togglePackingItem, deletePackingItem } from "@/app/actions/packing";

interface PackingItem {
  id: string;
  tripId: string;
  bagType: string;
  itemName: string;
  category: string;
  quantity: number;
  isPacked: boolean;
  notes: string | null;
  isEssential: boolean;
}

export function PackingPage({ tripId, items }: { tripId: string; items: PackingItem[] }) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBag, setSelectedBag] = useState("all");
  const [quickAdd, setQuickAdd] = useState("");
  const [quickBag, setQuickBag] = useState("main_suitcase");
  const [quickCategory, setQuickCategory] = useState("clothes");
  const [loading, setLoading] = useState(false);

  const filtered = selectedBag === "all" ? items : items.filter((i) => i.bagType === selectedBag);

  // Group by bag
  const grouped = filtered.reduce<Record<string, PackingItem[]>>((acc, item) => {
    if (!acc[item.bagType]) acc[item.bagType] = [];
    acc[item.bagType].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.isPacked).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  const essentialMissing = items.filter((i) => i.isEssential && !i.isPacked);

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAdd.trim()) return;
    setLoading(true);
    await createPackingItem({
      tripId,
      bagType: quickBag,
      itemName: quickAdd.trim(),
      category: quickCategory,
    });
    setQuickAdd("");
    setLoading(false);
    router.refresh();
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await createPackingItem({
      tripId,
      bagType: fd.get("bagType") as string,
      itemName: fd.get("itemName") as string,
      category: fd.get("category") as string,
      quantity: Number(fd.get("quantity") || 1),
      isEssential: fd.get("isEssential") === "on",
      notes: (fd.get("notes") as string) || undefined,
    });
    setAddDialogOpen(false);
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
              <Luggage className="h-5 w-5" />
              <span className="font-semibold">Bagagem</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {packedItems}/{totalItems} itens ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Essential Missing Warning */}
      {essentialMissing.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-orange-400 bg-orange-500/10 rounded-md p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{essentialMissing.length} item(ns) essencial(is) faltando:</p>
            <p className="text-xs mt-1">{essentialMissing.map((i) => i.itemName).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 flex-wrap">
        <select value={quickBag} onChange={(e) => setQuickBag(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {BAG_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {PACKING_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Input value={quickAdd} onChange={(e) => setQuickAdd(e.target.value)}
          placeholder="Nome do item..." className="flex-1 min-w-40"
        />
        <Button type="submit" size="sm" disabled={loading || !quickAdd.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Bag Filter + Add Button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Detalhado
        </Button>
        <div className="ml-auto" />
        <select value={selectedBag} onChange={(e) => setSelectedBag(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="all">Todas as malas</option>
          {BAG_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>

      {/* Items by Bag */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum item na bagagem.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([bagType, bagItems]) => {
          const bag = BAG_TYPES.find((b) => b.value === bagType);
          const bagPacked = bagItems.filter((i) => i.isPacked).length;
          const bagProgress = Math.round((bagPacked / bagItems.length) * 100);

          // Sub-group by category
          const byCategory = bagItems.reduce<Record<string, PackingItem[]>>((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});

          return (
            <Card key={bagType}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Luggage className="h-4 w-4" />
                  <span className="font-semibold text-sm">{bag?.label || bagType}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {bagPacked}/{bagItems.length}
                  </span>
                  <Progress value={bagProgress} className="h-1 w-16" />
                </div>

                {Object.entries(byCategory).map(([category, catItems]) => {
                  const cat = PACKING_CATEGORIES.find((c) => c.value === category);
                  return (
                    <div key={category} className="mb-3 last:mb-0">
                      <p className="text-xs text-muted-foreground font-medium mb-1 pl-1">
                        {cat?.label || category}
                      </p>
                      {catItems.map((item) => (
                        <div key={item.id}
                          className="flex items-center gap-2.5 group rounded-md px-2.5 py-1.5 hover:bg-accent/50 transition-colors"
                        >
                          <button onClick={() => { togglePackingItem(item.id); router.refresh(); }} className="shrink-0">
                            {item.isPacked ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${item.isPacked ? "line-through text-muted-foreground" : ""}`}>
                            {item.itemName}
                            {item.quantity > 1 && (
                              <span className="text-xs text-muted-foreground ml-1">×{item.quantity}</span>
                            )}
                          </span>
                          {item.isEssential && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">!</Badge>
                          )}
                          <button onClick={() => { deletePackingItem(item.id); router.refresh(); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
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
              <Label htmlFor="itemName">Nome *</Label>
              <Input id="itemName" name="itemName" required placeholder="Ex: Camiseta preta" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bagType">Mala</Label>
                <select id="bagType" name="bagType" defaultValue="main_suitcase"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {BAG_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select id="category" name="category" defaultValue="clothes"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {PACKING_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" name="quantity" type="number" defaultValue={1} min={1} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isEssential" className="rounded" />
                  Essencial
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input id="notes" name="notes" placeholder="Observações..." />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
