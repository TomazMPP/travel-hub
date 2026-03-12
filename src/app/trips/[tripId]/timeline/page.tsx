import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getCities } from "@/app/actions/cities";
import { getSegments } from "@/app/actions/segments";
import { AppShell } from "@/components/app-shell";
import { TimelinePage } from "@/components/timeline/timeline-page";
import { db } from "@/lib/db";

export default async function TimelineRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, cities, segments, itineraryItems, bookings, tasks] = await Promise.all([
    getTrip(tripId),
    getCities(tripId),
    getSegments(tripId),
    db.itineraryItem.findMany({
      where: { tripId },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { city: { select: { name: true } } },
    }),
    db.booking.findMany({
      where: { tripId },
      orderBy: { startDatetime: "asc" },
      include: { city: { select: { name: true } } },
    }),
    db.task.findMany({
      where: { tripId, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Timeline">
      <TimelinePage
        trip={trip}
        cities={cities}
        segments={segments}
        itineraryItems={itineraryItems}
        bookings={bookings}
        tasks={tasks}
      />
    </AppShell>
  );
}
