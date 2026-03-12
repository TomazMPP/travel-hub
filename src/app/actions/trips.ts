"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTrips() {
  return db.trip.findMany({
    orderBy: { startDate: "desc" },
    include: {
      cities: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true } },
      _count: {
        select: {
          tasks: { where: { status: { not: "done" } } },
          checklistItems: { where: { isCompleted: false } },
          expenses: true,
        },
      },
    },
  });
}

export async function getTrip(id: string) {
  return db.trip.findUnique({
    where: { id },
    include: {
      cities: { orderBy: { sortOrder: "asc" } },
      segments: {
        orderBy: { sortOrder: "asc" },
        include: { fromCity: true, toCity: true },
      },
    },
  });
}

export async function createTrip(data: {
  title: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  baseCurrency?: string;
  notes?: string;
  status?: string;
}) {
  const trip = await db.trip.create({ data });
  revalidatePath("/");
  return trip;
}

export async function updateTrip(
  id: string,
  data: {
    title?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
    baseCurrency?: string;
    notes?: string;
    status?: string;
    timezone?: string;
    dateFormat?: string;
    departureFromHome?: string;
    returnHome?: string;
    coverImage?: string;
  }
) {
  const trip = await db.trip.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath(`/trips/${id}`);
  return trip;
}

export async function deleteTrip(id: string) {
  await db.trip.delete({ where: { id } });
  revalidatePath("/");
}

export async function duplicateTrip(id: string) {
  const original = await db.trip.findUnique({
    where: { id },
    include: {
      cities: true,
      checklistItems: true,
      packingItems: true,
    },
  });
  if (!original) throw new Error("Trip not found");

  const { id: _, createdAt, updatedAt, cities, checklistItems, packingItems, ...tripData } = original;

  const newTrip = await db.trip.create({
    data: {
      ...tripData,
      title: `${tripData.title} (cópia)`,
      status: "planning",
      startDate: null,
      endDate: null,
    },
  });

  // Duplicate cities
  const cityMap = new Map<string, string>();
  for (const city of cities) {
    const { id: cId, tripId, createdAt: _, updatedAt: _u, ...cityData } = city;
    const newCity = await db.tripCity.create({
      data: { ...cityData, tripId: newTrip.id, arrivalDate: null, departureDate: null },
    });
    cityMap.set(cId, newCity.id);
  }

  // Duplicate checklist
  for (const item of checklistItems) {
    const { id: _, tripId, createdAt: _c, updatedAt: _u, ...itemData } = item;
    await db.checklistItem.create({
      data: { ...itemData, tripId: newTrip.id, isCompleted: false },
    });
  }

  // Duplicate packing list
  for (const item of packingItems) {
    const { id: _, tripId, createdAt: _c, updatedAt: _u, ...itemData } = item;
    await db.packingItem.create({
      data: { ...itemData, tripId: newTrip.id, isPacked: false },
    });
  }

  revalidatePath("/");
  return newTrip;
}
