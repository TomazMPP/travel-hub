import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { getTasks } from "@/app/actions/tasks";
import { getCities } from "@/app/actions/cities";
import { AppShell } from "@/components/app-shell";
import { TasksPage } from "@/components/tasks/tasks-page";

export default async function TasksRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, tasks, cities] = await Promise.all([
    getTrip(tripId),
    getTasks(tripId),
    getCities(tripId),
  ]);

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id} tripTitle={trip.title} pageTitle="Tarefas">
      <TasksPage tripId={trip.id} tasks={tasks} cities={cities} />
    </AppShell>
  );
}
