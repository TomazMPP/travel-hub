"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSegments(tripId: string) {
  return db.segment.findMany({
    where: { tripId },
    orderBy: { sortOrder: "asc" },
    include: { fromCity: true, toCity: true },
  });
}

export async function createSegment(data: {
  tripId: string;
  fromCityId?: string;
  toCityId?: string;
  transportType?: string;
  departureDatetime?: string;
  arrivalDatetime?: string;
  bookingReference?: string;
  provider?: string;
  seatInfo?: string;
  notes?: string;
}) {
  const maxOrder = await db.segment.findFirst({
    where: { tripId: data.tripId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const segment = await db.segment.create({
    data: {
      ...data,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${data.tripId}`);
  return segment;
}

export async function updateSegment(
  id: string,
  data: {
    fromCityId?: string;
    toCityId?: string;
    transportType?: string;
    departureDatetime?: string;
    arrivalDatetime?: string;
    bookingReference?: string;
    provider?: string;
    seatInfo?: string;
    notes?: string;
  }
) {
  const segment = await db.segment.update({ where: { id }, data });
  revalidatePath(`/trips/${segment.tripId}`);
  return segment;
}

export async function deleteSegment(id: string) {
  const segment = await db.segment.findUnique({ where: { id }, select: { tripId: true } });
  await db.segment.delete({ where: { id } });
  if (segment) revalidatePath(`/trips/${segment.tripId}`);
}
