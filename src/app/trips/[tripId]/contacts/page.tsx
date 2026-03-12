import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getContacts } from "@/app/actions/contacts";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { ContactsPage } from "@/components/contacts/contacts-page";

export default async function ContactsRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, contacts, cities] = await Promise.all([
    getTrip(tripId),
    getContacts(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Contatos">
      <ContactsPage trip={trip} contacts={contacts} cities={cities} />
    </AppShell>
  );
}
