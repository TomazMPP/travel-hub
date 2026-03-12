import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getTripDashboardData } from "@/app/actions/dashboard";
import { AppShell } from "@/components/app-shell";
import { TripDashboard } from "@/components/trips/trip-dashboard";

export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, dashboardData] = await Promise.all([
    getTrip(tripId),
    getTripDashboardData(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Dashboard">
      <TripDashboard trip={trip} data={dashboardData} />
    </AppShell>
  );
}
