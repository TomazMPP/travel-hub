import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getPackingItems } from "@/app/actions/packing";
import { AppShell } from "@/components/app-shell";
import { PackingPage } from "@/components/packing/packing-page";

export default async function PackingRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, items] = await Promise.all([
    getTrip(tripId),
    getPackingItems(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Bagagem">
      <PackingPage tripId={trip.id} items={items} />
    </AppShell>
  );
}
