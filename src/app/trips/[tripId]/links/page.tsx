import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getLinks } from "@/app/actions/links";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { LinksPage } from "@/components/links/links-page";

export default async function LinksRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, links, cities] = await Promise.all([
    getTrip(tripId),
    getLinks(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Links Úteis">
      <LinksPage trip={trip} links={links} cities={cities} />
    </AppShell>
  );
}
