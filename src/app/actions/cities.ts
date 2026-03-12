"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCities(tripId: string) {
  return db.tripCity.findMany({
    where: { tripId },
    orderBy: { sortOrder: "asc" },
    include: {
      segmentsFrom: {
        include: { toCity: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createCity(data: {
  tripId: string;
  name: string;
  country?: string;
  arrivalDate?: string;
  departureDate?: string;
  plannedNights?: number;
  notes?: string;
}) {
  const maxOrder = await db.tripCity.findFirst({
    where: { tripId: data.tripId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const city = await db.tripCity.create({
    data: {
      ...data,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${data.tripId}`);
  return city;
}

export async function updateCity(
  id: string,
  data: {
    name?: string;
    country?: string;
    arrivalDate?: string;
    departureDate?: string;
    plannedNights?: number;
    notes?: string;
  }
) {
  const city = await db.tripCity.update({ where: { id }, data });
  revalidatePath(`/trips/${city.tripId}`);
  return city;
}

export async function deleteCity(id: string) {
  const city = await db.tripCity.findUnique({ where: { id }, select: { tripId: true } });
  await db.tripCity.delete({ where: { id } });
  if (city) revalidatePath(`/trips/${city.tripId}`);
}

export async function reorderCities(tripId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db.tripCity.update({
      where: { id: orderedIds[i] },
      data: { sortOrder: i },
    });
  }
  revalidatePath(`/trips/${tripId}`);
}
