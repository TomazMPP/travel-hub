"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getContacts(tripId: string, cityId?: string) {
  return db.contact.findMany({
    where: { tripId, ...(cityId ? { cityId } : {}) },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
    include: { city: { select: { name: true } } },
  });
}

export async function createContact(data: {
  tripId: string;
  cityId?: string;
  name: string;
  type?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  isFavorite?: boolean;
}) {
  const contact = await db.contact.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return contact;
}

export async function updateContact(id: string, data: {
  name?: string;
  type?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  cityId?: string | null;
  isFavorite?: boolean;
}) {
  const contact = await db.contact.update({ where: { id }, data });
  revalidatePath(`/trips/${contact.tripId}`);
  return contact;
}

export async function deleteContact(id: string) {
  const c = await db.contact.findUnique({ where: { id }, select: { tripId: true } });
  await db.contact.delete({ where: { id } });
  if (c) revalidatePath(`/trips/${c.tripId}`);
}

export async function toggleContactFavorite(id: string) {
  const c = await db.contact.findUnique({ where: { id } });
  if (!c) return;
  await db.contact.update({ where: { id }, data: { isFavorite: !c.isFavorite } });
  revalidatePath(`/trips/${c.tripId}`);
}
