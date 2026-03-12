"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getItineraryItems(
  tripId: string,
  date?: string,
  cityId?: string
) {
  const where: Record<string, unknown> = { tripId };
  if (date) where.date = date;
  if (cityId) where.cityId = cityId;

  return db.itineraryItem.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { sortOrder: "asc" }],
    include: { city: { select: { id: true, name: true } } },
  });
}

export async function createItineraryItem(data: {
  tripId: string;
  cityId?: string | null;
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  googleMapsUrl?: string;
  category?: string;
  status?: string;
}) {
  const maxOrder = await db.itineraryItem.findFirst({
    where: { tripId: data.tripId, date: data.date },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await db.itineraryItem.create({
    data: {
      ...data,
      cityId: data.cityId || null,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${data.tripId}/itinerary`);
  return item;
}

export async function updateItineraryItem(
  id: string,
  data: {
    cityId?: string | null;
    date?: string;
    title?: string;
    description?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    locationName?: string | null;
    address?: string | null;
    googleMapsUrl?: string | null;
    category?: string;
    status?: string;
    sortOrder?: number;
  }
) {
  const item = await db.itineraryItem.update({ where: { id }, data });
  revalidatePath(`/trips/${item.tripId}/itinerary`);
  return item;
}

export async function deleteItineraryItem(id: string) {
  const item = await db.itineraryItem.findUnique({
    where: { id },
    select: { tripId: true },
  });
  await db.itineraryItem.delete({ where: { id } });
  if (item) revalidatePath(`/trips/${item.tripId}/itinerary`);
}

export async function duplicateItineraryItem(id: string, newDate: string) {
  const original = await db.itineraryItem.findUnique({ where: { id } });
  if (!original) throw new Error("Item not found");

  const {
    id: _,
    createdAt,
    updatedAt,
    sortOrder,
    ...itemData
  } = original;

  const maxOrder = await db.itineraryItem.findFirst({
    where: { tripId: original.tripId, date: newDate },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const newItem = await db.itineraryItem.create({
    data: {
      ...itemData,
      date: newDate,
      status: "planned",
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${original.tripId}/itinerary`);
  return newItem;
}
