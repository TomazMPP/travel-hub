import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getExpenses, getPaymentMethods } from "@/app/actions/finances";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { FinancesPage } from "@/components/finances/finances-page";

export default async function FinancesRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, expenses, paymentMethods, cities] = await Promise.all([
    getTrip(tripId),
    getExpenses(tripId),
    getPaymentMethods(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Financeiro">
      <FinancesPage
        tripId={trip.id}
        baseCurrency={trip.baseCurrency}
        expenses={expenses}
        paymentMethods={paymentMethods}
        cities={cities}
      />
    </AppShell>
  );
}
