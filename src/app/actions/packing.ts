"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPackingItems(tripId: string) {
  return db.packingItem.findMany({
    where: { tripId },
    orderBy: [{ bagType: "asc" }, { category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createPackingItem(data: {
  tripId: string;
  bagType: string;
  itemName: string;
  category: string;
  quantity?: number;
  notes?: string;
  isEssential?: boolean;
}) {
  const maxOrder = await db.packingItem.findFirst({
    where: { tripId: data.tripId, bagType: data.bagType },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await db.packingItem.create({
    data: { ...data, sortOrder: (maxOrder?.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/trips/${data.tripId}`);
  return item;
}

export async function togglePackingItem(id: string) {
  const item = await db.packingItem.findUnique({ where: { id } });
  if (!item) return;
  const updated = await db.packingItem.update({
    where: { id },
    data: { isPacked: !item.isPacked },
  });
  revalidatePath(`/trips/${updated.tripId}`);
  return updated;
}

export async function deletePackingItem(id: string) {
  const item = await db.packingItem.findUnique({ where: { id }, select: { tripId: true } });
  await db.packingItem.delete({ where: { id } });
  if (item) revalidatePath(`/trips/${item.tripId}`);
}

export async function duplicatePackingList(fromTripId: string, toTripId: string) {
  const items = await db.packingItem.findMany({ where: { tripId: fromTripId } });
  for (const item of items) {
    const { id, tripId, createdAt, updatedAt, ...data } = item;
    await db.packingItem.create({
      data: { ...data, tripId: toTripId, isPacked: false },
    });
  }
  revalidatePath(`/trips/${toTripId}`);
}
