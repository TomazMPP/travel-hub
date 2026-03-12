"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExpenses(tripId: string) {
  return db.expense.findMany({
    where: { tripId },
    orderBy: { expenseDate: "desc" },
    include: { city: { select: { name: true } } },
  });
}

export async function createExpense(data: {
  tripId: string;
  cityId?: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  convertedAmountBase?: number;
  expenseDate?: string;
  paymentMethod?: string;
  isPlanned?: boolean;
  notes?: string;
}) {
  const expense = await db.expense.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return expense;
}

export async function updateExpense(
  id: string,
  data: {
    cityId?: string | null;
    category?: string;
    description?: string;
    amount?: number;
    currency?: string;
    convertedAmountBase?: number;
    expenseDate?: string;
    paymentMethod?: string;
    isPlanned?: boolean;
    notes?: string;
  }
) {
  const expense = await db.expense.update({ where: { id }, data });
  revalidatePath(`/trips/${expense.tripId}`);
  return expense;
}

export async function deleteExpense(id: string) {
  const expense = await db.expense.findUnique({ where: { id }, select: { tripId: true } });
  await db.expense.delete({ where: { id } });
  if (expense) revalidatePath(`/trips/${expense.tripId}`);
}

export async function getPaymentMethods(tripId: string) {
  return db.paymentMethod.findMany({
    where: { tripId },
    orderBy: { name: "asc" },
  });
}

export async function createPaymentMethod(data: {
  tripId: string;
  type: string;
  name: string;
  currency?: string;
  initialBalance?: number;
  notes?: string;
}) {
  const method = await db.paymentMethod.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return method;
}

export async function deletePaymentMethod(id: string) {
  const method = await db.paymentMethod.findUnique({ where: { id }, select: { tripId: true } });
  await db.paymentMethod.delete({ where: { id } });
  if (method) revalidatePath(`/trips/${method.tripId}`);
}
