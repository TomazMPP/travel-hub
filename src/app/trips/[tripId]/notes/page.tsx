import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getNotes } from "@/app/actions/notes";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { NotesPage } from "@/components/notes/notes-page";

export default async function NotesRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, notes, cities] = await Promise.all([
    getTrip(tripId),
    getNotes(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Notas">
      <NotesPage trip={trip} notes={notes} cities={cities} />
    </AppShell>
  );
}
