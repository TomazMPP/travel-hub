import { getTrips } from "./actions/trips";
import { AppShell } from "@/components/app-shell";
import { TripsListPage } from "@/components/trips/trips-list-page";

export default async function Home() {
  const trips = await getTrips();

  return (
    <AppShell pageTitle="Minhas Viagens">
      <TripsListPage trips={trips} />
    </AppShell>
  );
}
