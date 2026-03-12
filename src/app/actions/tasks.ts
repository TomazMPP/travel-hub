"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTasks(tripId: string) {
  return db.task.findMany({
    where: { tripId },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    include: { city: { select: { name: true } } },
  });
}

export async function createTask(data: {
  tripId: string;
  cityId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  category?: string;
}) {
  const task = await db.task.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return task;
}

export async function updateTask(id: string, data: {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  category?: string;
  cityId?: string | null;
}) {
  const task = await db.task.update({ where: { id }, data });
  revalidatePath(`/trips/${task.tripId}`);
  return task;
}

export async function deleteTask(id: string) {
  const t = await db.task.findUnique({ where: { id }, select: { tripId: true } });
  await db.task.delete({ where: { id } });
  if (t) revalidatePath(`/trips/${t.tripId}`);
}

export async function toggleTaskStatus(id: string) {
  const t = await db.task.findUnique({ where: { id } });
  if (!t) return;
  const nextStatus = t.status === "done" ? "pending" : "done";
  await db.task.update({ where: { id }, data: { status: nextStatus } });
  revalidatePath(`/trips/${t.tripId}`);
}
