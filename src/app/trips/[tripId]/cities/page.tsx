import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getCities } from "@/app/actions/cities";
import { getSegments } from "@/app/actions/segments";
import { AppShell } from "@/components/app-shell";
import { CitiesPage } from "@/components/cities/cities-page";

export default async function CitiesRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, cities, segments] = await Promise.all([
    getTrip(tripId),
    getCities(tripId),
    getSegments(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Cidades & Rota">
      <CitiesPage trip={trip} cities={cities} segments={segments} />
    </AppShell>
  );
}
