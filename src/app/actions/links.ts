"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLinks(tripId: string, cityId?: string) {
  return db.usefulLink.findMany({
    where: { tripId, ...(cityId ? { cityId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { city: { select: { name: true } } },
  });
}

export async function createLink(data: {
  tripId: string;
  cityId?: string;
  title: string;
  url: string;
  category?: string;
  notes?: string;
}) {
  const link = await db.usefulLink.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return link;
}

export async function updateLink(id: string, data: {
  title?: string;
  url?: string;
  category?: string;
  notes?: string;
  cityId?: string | null;
}) {
  const link = await db.usefulLink.update({ where: { id }, data });
  revalidatePath(`/trips/${link.tripId}`);
  return link;
}

export async function deleteLink(id: string) {
  const l = await db.usefulLink.findUnique({ where: { id }, select: { tripId: true } });
  await db.usefulLink.delete({ where: { id } });
  if (l) revalidatePath(`/trips/${l.tripId}`);
}
