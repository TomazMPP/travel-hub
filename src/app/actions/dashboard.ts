"use server";

import { db } from "@/lib/db";

export async function getTripDashboardData(tripId: string) {
  const [
    cities,
    nextSegment,
    pendingTasks,
    pendingChecklist,
    upcomingBookings,
    expenses,
    criticalDocuments,
    pinnedNotes,
  ] = await Promise.all([
    db.tripCity.findMany({
      where: { tripId },
      orderBy: { sortOrder: "asc" },
    }),
    db.segment.findFirst({
      where: {
        tripId,
        departureDatetime: { gte: new Date().toISOString() },
      },
      orderBy: { departureDatetime: "asc" },
      include: { fromCity: true, toCity: true },
    }),
    db.task.findMany({
      where: { tripId, status: { not: "done" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 5,
    }),
    db.checklistItem.count({
      where: { tripId, isCompleted: false },
    }),
    db.booking.findMany({
      where: {
        tripId,
        startDatetime: { gte: new Date().toISOString().split("T")[0] },
      },
      orderBy: { startDatetime: "asc" },
      take: 5,
      include: { city: true },
    }),
    db.expense.findMany({
      where: { tripId },
    }),
    db.document.findMany({
      where: { tripId, isCritical: true },
      take: 5,
    }),
    db.note.findMany({
      where: { tripId, pinned: true },
      take: 3,
    }),
  ]);

  const totalChecklistItems = await db.checklistItem.count({
    where: { tripId },
  });

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (e.isPlanned ? 0 : (e.convertedAmountBase ?? e.amount)),
    0
  );
  const plannedBudget = expenses.reduce(
    (sum, e) => sum + (e.isPlanned ? (e.convertedAmountBase ?? e.amount) : 0),
    0
  );

  return {
    cities,
    nextSegment,
    pendingTasks,
    pendingChecklist,
    totalChecklistItems,
    upcomingBookings,
    totalExpenses,
    plannedBudget,
    criticalDocuments,
    pinnedNotes,
  };
}
