"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDocuments(
  tripId: string,
  filters?: { type?: string; isCritical?: boolean }
) {
  const where: Record<string, unknown> = { tripId };

  if (filters?.type) {
    where.documentType = filters.type;
  }
  if (filters?.isCritical !== undefined) {
    where.isCritical = filters.isCritical;
  }

  return db.document.findMany({
    where,
    orderBy: [{ isCritical: "desc" }, { expiresAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function createDocument(data: {
  tripId: string;
  documentType?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  issuedAt?: string;
  expiresAt?: string;
  isCritical?: boolean;
  tags?: string;
}) {
  const document = await db.document.create({ data });
  revalidatePath(`/trips/${data.tripId}/documents`);
  return document;
}

export async function updateDocument(
  id: string,
  data: {
    documentType?: string;
    title?: string;
    description?: string;
    fileUrl?: string;
    issuedAt?: string;
    expiresAt?: string;
    isCritical?: boolean;
    tags?: string;
  }
) {
  const document = await db.document.update({ where: { id }, data });
  revalidatePath(`/trips/${document.tripId}/documents`);
  return document;
}

export async function deleteDocument(id: string) {
  const document = await db.document.findUnique({
    where: { id },
    select: { tripId: true },
  });
  await db.document.delete({ where: { id } });
  if (document) revalidatePath(`/trips/${document.tripId}/documents`);
}
