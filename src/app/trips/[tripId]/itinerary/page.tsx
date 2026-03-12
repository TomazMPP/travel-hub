import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getCities } from "@/app/actions/cities";
import { getItineraryItems } from "@/app/actions/itinerary";
import { AppShell } from "@/components/app-shell";
import { ItineraryPage } from "@/components/itinerary/itinerary-page";

export default async function ItineraryRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, cities, items] = await Promise.all([
    getTrip(tripId),
    getCities(tripId),
    getItineraryItems(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Roteiro Diário">
      <ItineraryPage trip={trip} cities={cities} items={items} />
    </AppShell>
  );
}
