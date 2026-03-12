"use server";

import { db } from "@/lib/db";

export type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  url: string;
};

export async function globalSearch(tripId: string, query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const q = `%${query}%`;
  const results: SearchResult[] = [];

  // Search cities
  const cities = await db.tripCity.findMany({
    where: { tripId, OR: [{ name: { contains: query } }, { country: { contains: query } }] },
  });
  cities.forEach((c) =>
    results.push({ type: "city", id: c.id, title: c.name, subtitle: c.country || undefined, url: `/trips/${tripId}/cities` })
  );

  // Search bookings
  const bookings = await db.booking.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { provider: { contains: query } }, { bookingCode: { contains: query } }] },
  });
  bookings.forEach((b) =>
    results.push({ type: "booking", id: b.id, title: b.title, subtitle: b.provider || undefined, url: `/trips/${tripId}/bookings` })
  );

  // Search itinerary
  const itinerary = await db.itineraryItem.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { locationName: { contains: query } }, { description: { contains: query } }] },
  });
  itinerary.forEach((i) =>
    results.push({ type: "itinerary", id: i.id, title: i.title, subtitle: i.date, url: `/trips/${tripId}/itinerary` })
  );

  // Search documents
  const documents = await db.document.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { description: { contains: query } }] },
  });
  documents.forEach((d) =>
    results.push({ type: "document", id: d.id, title: d.title, url: `/trips/${tripId}/documents` })
  );

  // Search notes
  const notes = await db.note.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { content: { contains: query } }] },
  });
  notes.forEach((n) =>
    results.push({ type: "note", id: n.id, title: n.title, subtitle: n.content?.substring(0, 60) || undefined, url: `/trips/${tripId}/notes` })
  );

  // Search contacts
  const contacts = await db.contact.findMany({
    where: { tripId, OR: [{ name: { contains: query } }, { phone: { contains: query } }, { email: { contains: query } }] },
  });
  contacts.forEach((c) =>
    results.push({ type: "contact", id: c.id, title: c.name, subtitle: c.phone || undefined, url: `/trips/${tripId}/contacts` })
  );

  // Search tasks
  const tasks = await db.task.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { description: { contains: query } }] },
  });
  tasks.forEach((t) =>
    results.push({ type: "task", id: t.id, title: t.title, url: `/trips/${tripId}/tasks` })
  );

  // Search links
  const links = await db.usefulLink.findMany({
    where: { tripId, OR: [{ title: { contains: query } }, { url: { contains: query } }] },
  });
  links.forEach((l) =>
    results.push({ type: "link", id: l.id, title: l.title, subtitle: l.url, url: `/trips/${tripId}/links` })
  );

  return results;
}
