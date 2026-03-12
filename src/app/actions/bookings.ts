"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBookings(
  tripId: string,
  filters?: { type?: string; cityId?: string; status?: string }
) {
  return db.booking.findMany({
    where: {
      tripId,
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.cityId ? { cityId: filters.cityId } : {}),
      ...(filters?.status ? { paymentStatus: filters.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { city: true },
  });
}

export async function createBooking(data: {
  tripId: string;
  cityId?: string;
  type?: string;
  title: string;
  provider?: string;
  bookingCode?: string;
  startDatetime?: string;
  endDatetime?: string;
  address?: string;
  priceAmount?: number;
  priceCurrency?: string;
  paymentStatus?: string;
  notes?: string;
  attachmentUrl?: string;
  externalUrl?: string;
}) {
  const booking = await db.booking.create({ data });
  revalidatePath(`/trips/${data.tripId}`);
  return booking;
}

export async function updateBooking(
  id: string,
  data: {
    cityId?: string | null;
    type?: string;
    title?: string;
    provider?: string;
    bookingCode?: string;
    startDatetime?: string;
    endDatetime?: string;
    address?: string;
    priceAmount?: number | null;
    priceCurrency?: string;
    paymentStatus?: string;
    notes?: string;
    attachmentUrl?: string;
    externalUrl?: string;
  }
) {
  const booking = await db.booking.update({ where: { id }, data });
  revalidatePath(`/trips/${booking.tripId}`);
  return booking;
}

export async function deleteBooking(id: string) {
  const booking = await db.booking.findUnique({
    where: { id },
    select: { tripId: true },
  });
  await db.booking.delete({ where: { id } });
  if (booking) revalidatePath(`/trips/${booking.tripId}`);
}
