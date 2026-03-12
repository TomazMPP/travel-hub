import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { AppShell } from "@/components/app-shell";
import { SettingsPage } from "@/components/settings/settings-page";

export default async function SettingsRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Configurações">
      <SettingsPage trip={trip} />
    </AppShell>
  );
}
