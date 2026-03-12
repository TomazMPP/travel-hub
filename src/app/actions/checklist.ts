"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getChecklistItems(tripId: string, category?: string) {
  return db.checklistItem.findMany({
    where: {
      tripId,
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createChecklistItem(data: {
  tripId: string;
  category: string;
  title: string;
  description?: string;
  dueDate?: string;
}) {
  const maxOrder = await db.checklistItem.findFirst({
    where: { tripId: data.tripId, category: data.category },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await db.checklistItem.create({
    data: { ...data, sortOrder: (maxOrder?.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`/trips/${data.tripId}`);
  return item;
}

export async function updateChecklistItem(
  id: string,
  data: { title?: string; description?: string; dueDate?: string; category?: string; isCompleted?: boolean }
) {
  const item = await db.checklistItem.update({ where: { id }, data });
  revalidatePath(`/trips/${item.tripId}`);
  return item;
}

export async function toggleChecklistItem(id: string) {
  const item = await db.checklistItem.findUnique({ where: { id } });
  if (!item) return;
  const updated = await db.checklistItem.update({
    where: { id },
    data: { isCompleted: !item.isCompleted },
  });
  revalidatePath(`/trips/${updated.tripId}`);
  return updated;
}

export async function deleteChecklistItem(id: string) {
  const item = await db.checklistItem.findUnique({ where: { id }, select: { tripId: true } });
  await db.checklistItem.delete({ where: { id } });
  if (item) revalidatePath(`/trips/${item.tripId}`);
}

export async function applyChecklistTemplate(tripId: string, templateName: string) {
  const templates: Record<string, { category: string; title: string }[]> = {
    international: [
      { category: "documents", title: "Verificar validade do passaporte" },
      { category: "documents", title: "Emitir PID (Permissão Internacional para Dirigir)" },
      { category: "documents", title: "Imprimir comprovante de seguro viagem" },
      { category: "documents", title: "Fazer cópias digitais de todos os documentos" },
      { category: "financial", title: "Avisar banco sobre viagem internacional" },
      { category: "financial", title: "Converter moeda (casa de câmbio)" },
      { category: "financial", title: "Ativar cartão internacional" },
      { category: "financial", title: "Verificar limite do cartão de crédito" },
      { category: "health", title: "Verificar vacinas necessárias" },
      { category: "health", title: "Comprar seguro viagem" },
      { category: "health", title: "Separar remédios pessoais" },
      { category: "tech", title: "Comprar chip internacional ou eSIM" },
      { category: "tech", title: "Baixar mapas offline" },
      { category: "tech", title: "Verificar adaptadores de tomada" },
      { category: "bookings", title: "Confirmar reservas de hospedagem" },
      { category: "bookings", title: "Confirmar passagens aéreas" },
      { category: "transport", title: "Pesquisar transporte do aeroporto ao hotel" },
      { category: "home", title: "Pedir para alguém cuidar das plantas" },
      { category: "home", title: "Parar entregas / correspondência" },
      { category: "home", title: "Verificar gás e luzes" },
    ],
    one_month: [
      { category: "luggage", title: "Separar roupas para lavar antes de viajar" },
      { category: "luggage", title: "Verificar peso máximo da mala" },
      { category: "luggage", title: "Comprar itens de viagem faltantes" },
      { category: "tech", title: "Levar power bank carregado" },
      { category: "tech", title: "Backup do celular e notebook" },
      { category: "health", title: "Agendar check-up médico" },
      { category: "financial", title: "Definir orçamento diário" },
      { category: "bookings", title: "Reservar primeiras hospedagens" },
      { category: "transport", title: "Pesquisar passes de transporte" },
    ],
    with_laptop: [
      { category: "tech", title: "Backup do notebook" },
      { category: "tech", title: "Verificar carregador e adaptador" },
      { category: "tech", title: "Mouse e fone de ouvido" },
      { category: "tech", title: "Instalar VPN" },
      { category: "tech", title: "Cabo HDMI/USB-C (caso precise)" },
    ],
    car_rental: [
      { category: "documents", title: "CNH válida" },
      { category: "documents", title: "PID (se necessário)" },
      { category: "bookings", title: "Confirmar reserva do carro" },
      { category: "bookings", title: "Verificar seguro do veículo" },
      { category: "transport", title: "Pesquisar regras de trânsito locais" },
      { category: "transport", title: "Baixar mapa offline da região" },
      { category: "transport", title: "Verificar pedágios e vinhetas" },
    ],
  };

  const items = templates[templateName];
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    await db.checklistItem.create({
      data: {
        tripId,
        category: items[i].category,
        title: items[i].title,
        sortOrder: i,
      },
    });
  }

  revalidatePath(`/trips/${tripId}`);
}
