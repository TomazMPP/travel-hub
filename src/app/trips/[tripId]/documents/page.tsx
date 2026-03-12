import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getDocuments } from "@/app/actions/documents";
import { AppShell } from "@/components/app-shell";
import { DocumentsPage } from "@/components/documents/documents-page";

export default async function DocumentsRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, documents] = await Promise.all([
    getTrip(tripId),
    getDocuments(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Documentos">
      <DocumentsPage trip={trip} documents={documents} />
    </AppShell>
  );
}
