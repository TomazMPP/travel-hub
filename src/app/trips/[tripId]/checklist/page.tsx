import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getChecklistItems } from "@/app/actions/checklist";
import { AppShell } from "@/components/app-shell";
import { ChecklistPage } from "@/components/checklist/checklist-page";

export default async function ChecklistRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, items] = await Promise.all([
    getTrip(tripId),
    getChecklistItems(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Checklist">
      <ChecklistPage tripId={trip.id} items={items} />
    </AppShell>
  );
}
