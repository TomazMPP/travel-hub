"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, DollarSign, CreditCard, TrendingUp, Edit2 } from "lucide-react";
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
import { EXPENSE_CATEGORIES, PAYMENT_METHOD_TYPES } from "@/lib/constants";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  createPaymentMethod,
  deletePaymentMethod,
} from "@/app/actions/finances";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmountBase: number | null;
  expenseDate: string | null;
  paymentMethod: string | null;
  isPlanned: boolean;
  notes: string | null;
  cityId: string | null;
  city: { name: string } | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  currency: string;
  initialBalance: number | null;
}

interface City {
  id: string;
  name: string;
}

export function FinancesPage({
  tripId,
  baseCurrency,
  expenses,
  paymentMethods,
  cities,
}: {
  tripId: string;
  baseCurrency: string;
  expenses: Expense[];
  paymentMethods: PaymentMethod[];
  cities: City[];
}) {
  const router = useRouter();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const realExpenses = expenses.filter((e) => !e.isPlanned);
  const plannedExpenses = expenses.filter((e) => e.isPlanned);
  const filtered = filter === "all"
    ? realExpenses
    : filter === "planned"
    ? plannedExpenses
    : realExpenses.filter((e) => e.category === filter);

  const totalReal = realExpenses.reduce((s, e) => s + (e.convertedAmountBase ?? e.amount), 0);
  const totalPlanned = plannedExpenses.reduce((s, e) => s + (e.convertedAmountBase ?? e.amount), 0);

  // Per city
  const byCity = realExpenses.reduce<Record<string, number>>((acc, e) => {
    const city = e.city?.name || "Sem cidade";
    acc[city] = (acc[city] || 0) + (e.convertedAmountBase ?? e.amount);
    return acc;
  }, {});

  // Per category
  const byCategory = realExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.convertedAmountBase ?? e.amount);
    return acc;
  }, {});

  // Days with expenses
  const days = new Set(realExpenses.filter((e) => e.expenseDate).map((e) => e.expenseDate)).size;
  const avgPerDay = days > 0 ? totalReal / days : 0;

  async function handleExpenseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      category: fd.get("category") as string,
      description: fd.get("description") as string,
      amount: Number(fd.get("amount")),
      currency: (fd.get("currency") as string) || baseCurrency,
      expenseDate: (fd.get("expenseDate") as string) || undefined,
      cityId: (fd.get("cityId") as string) || undefined,
      paymentMethod: (fd.get("paymentMethod") as string) || undefined,
      isPlanned: fd.get("isPlanned") === "on",
      notes: (fd.get("notes") as string) || undefined,
    };

    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await createExpense({ tripId, ...data });
    }
    setExpenseDialogOpen(false);
    setEditingExpense(null);
    setLoading(false);
    router.refresh();
  }

  async function handlePaymentMethodSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await createPaymentMethod({
      tripId,
      type: fd.get("type") as string,
      name: fd.get("name") as string,
      currency: (fd.get("currency") as string) || baseCurrency,
      initialBalance: fd.get("initialBalance") ? Number(fd.get("initialBalance")) : undefined,
    });
    setPaymentDialogOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total gasto</p>
            <p className="text-lg font-bold">{baseCurrency} {totalReal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Orçamento</p>
            <p className="text-lg font-bold">{baseCurrency} {totalPlanned.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo estimado</p>
            <p className={`text-lg font-bold ${totalPlanned - totalReal < 0 ? "text-red-400" : "text-green-400"}`}>
              {baseCurrency} {(totalPlanned - totalReal).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média/dia</p>
            <p className="text-lg font-bold">{baseCurrency} {avgPerDay.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* By City */}
        {Object.keys(byCity).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Por cidade
              </h3>
              <div className="space-y-1">
                {Object.entries(byCity).sort((a, b) => b[1] - a[1]).map(([city, amount]) => (
                  <div key={city} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{city}</span>
                    <span>{baseCurrency} {amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Category */}
        {Object.keys(byCategory).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Por categoria
              </h3>
              <div className="space-y-1">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                  const catLabel = EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label || cat;
                  return (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{catLabel}</span>
                      <span>{baseCurrency} {amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Meios de Pagamento
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setPaymentDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {paymentMethods.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center gap-1.5 bg-accent rounded-md px-2 py-1">
                  <span className="text-sm">{pm.name}</span>
                  <Badge variant="outline" className="text-[10px]">{pm.currency}</Badge>
                  <button onClick={() => { deletePaymentMethod(pm.id); router.refresh(); }}>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gastos</h2>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            <option value="all">Todos</option>
            <option value="planned">Planejados</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => { setEditingExpense(null); setExpenseDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum gasto registrado.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((expense) => {
            const cat = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
            return (
              <Card key={expense.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{expense.description}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{cat?.label}</Badge>
                      {expense.isPlanned && <Badge className="text-[10px] shrink-0">Planejado</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {expense.city && <span>{expense.city.name}</span>}
                      {expense.expenseDate && (
                        <span>{new Date(expense.expenseDate + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      )}
                      {expense.paymentMethod && <span>{expense.paymentMethod}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditingExpense(expense); setExpenseDialogOpen(true); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={async () => { await deleteExpense(expense.id); router.refresh(); }}
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

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={(o) => { setExpenseDialogOpen(o); if (!o) setEditingExpense(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Editar Gasto" : "Novo Gasto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <Label>Descrição *</Label>
              <Input name="description" required defaultValue={editingExpense?.description || ""} placeholder="Ex: Jantar em Madrid" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input name="amount" type="number" step="0.01" required defaultValue={editingExpense?.amount || ""} />
              </div>
              <div>
                <Label>Moeda</Label>
                <select name="currency" defaultValue={editingExpense?.currency || baseCurrency}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="BRL">BRL</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <select name="category" defaultValue={editingExpense?.category || "food"}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Data</Label>
                <Input name="expenseDate" type="date" defaultValue={editingExpense?.expenseDate || ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <select name="cityId" defaultValue={editingExpense?.cityId || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Nenhuma</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Pagamento</Label>
                <Input name="paymentMethod" defaultValue={editingExpense?.paymentMethod || ""} placeholder="Ex: Revolut" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isPlanned" defaultChecked={editingExpense?.isPlanned} className="rounded" />
              Gasto planejado (orçamento)
            </label>
            <div>
              <Label>Notas</Label>
              <Textarea name="notes" rows={2} defaultValue={editingExpense?.notes || ""} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editingExpense ? "Salvar" : "Registrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Meio de Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentMethodSubmit} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input name="name" required placeholder="Ex: Revolut EUR" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <select name="type" defaultValue="credit_card"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {PAYMENT_METHOD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Moeda</Label>
                <select name="currency" defaultValue={baseCurrency}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="BRL">BRL</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Saldo inicial</Label>
              <Input name="initialBalance" type="number" step="0.01" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Criar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
