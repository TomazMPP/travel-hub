import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getBookings } from "@/app/actions/bookings";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { BookingsPage } from "@/components/bookings/bookings-page";

export default async function BookingsRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, bookings, cities] = await Promise.all([
    getTrip(tripId),
    getBookings(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Reservas">
      <BookingsPage trip={trip} bookings={bookings} cities={cities} />
    </AppShell>
  );
}
