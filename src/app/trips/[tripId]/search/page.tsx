import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { AppShell } from "@/components/app-shell";
import { SearchPage } from "@/components/search/search-page";

export default async function SearchRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Busca">
      <SearchPage tripId={trip.id} />
    </AppShell>
  );
}
