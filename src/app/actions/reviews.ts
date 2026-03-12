"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getReviews(tripId: string) {
  return db.cityReview.findMany({
    where: { tripId },
    include: { city: true },
    orderBy: { city: { sortOrder: "asc" } },
  });
}

export async function upsertReview(data: {
  tripId: string;
  cityId: string;
  costScore?: number;
  safetyScore?: number;
  beautyScore?: number;
  climateScore?: number;
  transportScore?: number;
  lifestyleScore?: number;
  wouldLiveHere?: boolean;
  pros?: string;
  cons?: string;
  finalNotes?: string;
}) {
  const existing = await db.cityReview.findUnique({ where: { cityId: data.cityId } });
  if (existing) {
    await db.cityReview.update({ where: { cityId: data.cityId }, data });
  } else {
    await db.cityReview.create({ data });
  }
  revalidatePath(`/trips/${data.tripId}`);
}

export async function deleteReview(id: string) {
  const r = await db.cityReview.findUnique({ where: { id }, select: { tripId: true } });
  await db.cityReview.delete({ where: { id } });
  if (r) revalidatePath(`/trips/${r.tripId}`);
}
