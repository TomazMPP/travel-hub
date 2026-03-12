import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getReviews } from "@/app/actions/reviews";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { ReviewsPage } from "@/components/reviews/reviews-page";

export default async function ReviewsRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, reviews, cities] = await Promise.all([
    getTrip(tripId),
    getReviews(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Avaliações">
      <ReviewsPage tripId={trip.id} reviews={reviews} cities={cities} />
    </AppShell>
  );
}
