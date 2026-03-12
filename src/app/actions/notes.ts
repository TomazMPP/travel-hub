"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNotes(tripId: string, cityId?: string) {
  return db.note.findMany({
    where: { tripId, ...(cityId ? { cityId } : {}) },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: { city: { select: { name: true } } },
  });
}

export async function createNote(data: {
  tripId: string;
  cityId?: string;
  title: string;
  content?: string;
  tags?: string;
  pinned?: boolean;
}) {
  const note = await db.note.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return note;
}

export async function updateNote(id: string, data: {
  title?: string;
  content?: string;
  tags?: string;
  cityId?: string | null;
  pinned?: boolean;
}) {
  const note = await db.note.update({ where: { id }, data });
  revalidatePath(`/trips/${note.tripId}`);
  return note;
}

export async function deleteNote(id: string) {
  const n = await db.note.findUnique({ where: { id }, select: { tripId: true } });
  await db.note.delete({ where: { id } });
  if (n) revalidatePath(`/trips/${n.tripId}`);
}

export async function toggleNotePin(id: string) {
  const n = await db.note.findUnique({ where: { id } });
  if (!n) return;
  await db.note.update({ where: { id }, data: { pinned: !n.pinned } });
  revalidatePath(`/trips/${n.tripId}`);
}
