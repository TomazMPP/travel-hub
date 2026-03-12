// prisma/seed.ts
// Seed básico: Trip + Cidades + Segmentos + Checklist pré-viagem + Tarefas
// Rodar: npx tsx prisma/seed.ts

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Trip ────────────────────────────────────────────────────
  const trip = await prisma.trip.create({
    data: {
      title: "Espanha Abril/Maio 2026",
      country: "Espanha",
      startDate: "2026-04-20",
      endDate: "2026-05-20",
      status: "planning",
      baseCurrency: "EUR",
      timezone: "Europe/Madrid",
      dateFormat: "dd/MM/yyyy",
      departureFromHome: "2026-04-19",
      returnHome: "2026-05-21",
      notes: "Viagem de reconhecimento pela Espanha. Foco em avaliar cidades para potencial moradia, custo de vida, transporte público, bairros e qualidade de vida real.",
    },
  });

  // ── Cidades (ordem da rota) ─────────────────────────────────
  const cities = await Promise.all([
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Madrid",
        country: "Espanha",
        arrivalDate: "2026-04-20",
        departureDate: "2026-04-25",
        plannedNights: 5,
        sortOrder: 0,
        notes: "Capital. Explorar bairros: Malasaña, Lavapiés, Chamberí. Metro, custo de vida, ritmo da cidade.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Toledo",
        country: "Espanha",
        arrivalDate: "2026-04-25",
        departureDate: "2026-04-26",
        plannedNights: 1,
        sortOrder: 1,
        notes: "Bate-volta ou 1 noite. Cidade medieval, patrimônio UNESCO.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Valencia",
        country: "Espanha",
        arrivalDate: "2026-04-26",
        departureDate: "2026-04-30",
        plannedNights: 4,
        sortOrder: 2,
        notes: "Cidade das Artes e Ciências, praia, Ruzafa. Boa relação custo-benefício. Avaliar para moradia.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Barcelona",
        country: "Espanha",
        arrivalDate: "2026-04-30",
        departureDate: "2026-05-05",
        plannedNights: 5,
        sortOrder: 3,
        notes: "Gràcia, Eixample, Barceloneta. Avaliar custo (mais caro), transporte, vida cultural.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Málaga",
        country: "Espanha",
        arrivalDate: "2026-05-05",
        departureDate: "2026-05-09",
        plannedNights: 4,
        sortOrder: 4,
        notes: "Costa del Sol. Clima, custo de vida, comunidade internacional. Centro histórico e bairros residenciais.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Granada",
        country: "Espanha",
        arrivalDate: "2026-05-09",
        departureDate: "2026-05-12",
        plannedNights: 3,
        sortOrder: 5,
        notes: "Alhambra, Albaicín. Cidade universitária, custo baixo. Avaliar ritmo de vida.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Sevilla",
        country: "Espanha",
        arrivalDate: "2026-05-12",
        departureDate: "2026-05-16",
        plannedNights: 4,
        sortOrder: 6,
        notes: "Triana, Santa Cruz. Cultura flamenca, gastronomia. Calor em maio, testar tolerância.",
      },
    }),
    prisma.tripCity.create({
      data: {
        tripId: trip.id,
        name: "Lisboa",
        country: "Portugal",
        arrivalDate: "2026-05-16",
        departureDate: "2026-05-20",
        plannedNights: 4,
        sortOrder: 7,
        notes: "Parada final antes de voltar. Comparar com Espanha. Idioma mais próximo, comunidade BR grande.",
      },
    }),
  ]);

  const [madrid, toledo, valencia, barcelona, malaga, granada, sevilla, lisboa] = cities;

  // ── Segmentos (deslocamentos) ───────────────────────────────
  await Promise.all([
    // São Paulo → Madrid (voo)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: null,
        toCityId: madrid.id,
        transportType: "flight",
        departureDatetime: "2026-04-19T22:00",
        arrivalDatetime: "2026-04-20T12:00",
        sortOrder: 0,
        notes: "Voo GRU → MAD. Pesquisar Iberia, LATAM, Air Europa.",
      },
    }),
    // Madrid → Toledo (trem)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: madrid.id,
        toCityId: toledo.id,
        transportType: "train",
        departureDatetime: "2026-04-25T09:00",
        arrivalDatetime: "2026-04-25T09:33",
        provider: "Renfe AVE",
        sortOrder: 1,
        notes: "33 min de trem. Atocha → Toledo. ~13€.",
      },
    }),
    // Toledo → Valencia (trem)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: toledo.id,
        toCityId: valencia.id,
        transportType: "train",
        departureDatetime: "2026-04-26T10:00",
        arrivalDatetime: "2026-04-26T12:30",
        provider: "Renfe",
        sortOrder: 2,
        notes: "Toledo → Madrid Atocha → Valencia Joaquín Sorolla. Conexão em Madrid.",
      },
    }),
    // Valencia → Barcelona (trem)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: valencia.id,
        toCityId: barcelona.id,
        transportType: "train",
        departureDatetime: "2026-04-30T08:30",
        arrivalDatetime: "2026-04-30T12:00",
        provider: "Renfe AVE",
        sortOrder: 3,
        notes: "~3h30. Comprar com antecedência no site Renfe.",
      },
    }),
    // Barcelona → Málaga (voo)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: barcelona.id,
        toCityId: malaga.id,
        transportType: "flight",
        departureDatetime: "2026-05-05T10:00",
        arrivalDatetime: "2026-05-05T12:00",
        sortOrder: 4,
        notes: "Vueling ou Ryanair. ~2h. Mais rápido que trem nesse trecho.",
      },
    }),
    // Málaga → Granada (bus)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: malaga.id,
        toCityId: granada.id,
        transportType: "bus",
        departureDatetime: "2026-05-09T09:00",
        arrivalDatetime: "2026-05-09T10:30",
        provider: "ALSA",
        sortOrder: 5,
        notes: "~1h30 de ônibus. Direto, frequente.",
      },
    }),
    // Granada → Sevilla (bus)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: granada.id,
        toCityId: sevilla.id,
        transportType: "bus",
        departureDatetime: "2026-05-12T09:00",
        arrivalDatetime: "2026-05-12T12:00",
        provider: "ALSA",
        sortOrder: 6,
        notes: "~3h. Alternativa: trem Renfe Media Distancia.",
      },
    }),
    // Sevilla → Lisboa (bus/trem)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: sevilla.id,
        toCityId: lisboa.id,
        transportType: "bus",
        departureDatetime: "2026-05-16T07:00",
        arrivalDatetime: "2026-05-16T14:00",
        provider: "ALSA / Rede Expressos",
        sortOrder: 7,
        notes: "~7h de ônibus. Alternativa: voo Sevilla→Lisboa ~1h.",
      },
    }),
    // Lisboa → São Paulo (voo)
    prisma.segment.create({
      data: {
        tripId: trip.id,
        fromCityId: lisboa.id,
        toCityId: null,
        transportType: "flight",
        departureDatetime: "2026-05-20T22:00",
        arrivalDatetime: "2026-05-21T06:00",
        sortOrder: 8,
        notes: "Voo LIS → GRU. TAP, LATAM.",
      },
    }),
  ]);

  // ── Checklist pré-viagem ────────────────────────────────────
  const checklistItems = [
    // Documentos
    { category: "documents", title: "Renovar passaporte (se necessário)", dueDate: "2026-03-01" },
    { category: "documents", title: "Verificar validade do passaporte (>6 meses)", dueDate: "2026-03-01" },
    { category: "documents", title: "Imprimir seguro viagem", dueDate: "2026-04-15" },
    { category: "documents", title: "Salvar cópia digital de todos os docs no celular", dueDate: "2026-04-15" },
    { category: "documents", title: "Comprovante de hospedagem para imigração", dueDate: "2026-04-10" },
    // Financeiro
    { category: "financial", title: "Ativar cartão internacional", dueDate: "2026-04-01" },
    { category: "financial", title: "Definir budget diário por cidade", dueDate: "2026-04-10" },
    { category: "financial", title: "Levar EUR em espécie (reserva)", dueDate: "2026-04-18" },
    { category: "financial", title: "Avisar banco sobre viagem internacional", dueDate: "2026-04-15" },
    // Saúde
    { category: "health", title: "Contratar seguro viagem", dueDate: "2026-03-15" },
    { category: "health", title: "Montar kit de remédios básicos", dueDate: "2026-04-15" },
    // Tech
    { category: "tech", title: "Comprar/ativar eSIM europeu", dueDate: "2026-04-10" },
    { category: "tech", title: "Baixar mapas offline (Google Maps) de todas as cidades", dueDate: "2026-04-18" },
    { category: "tech", title: "Instalar app Renfe, ALSA, Moovit", dueDate: "2026-04-15" },
    // Reservas
    { category: "bookings", title: "Reservar voo GRU → MAD", dueDate: "2026-03-15" },
    { category: "bookings", title: "Reservar voo LIS → GRU (volta)", dueDate: "2026-03-15" },
    { category: "bookings", title: "Reservar hospedagem Madrid (5 noites)", dueDate: "2026-03-20" },
    { category: "bookings", title: "Reservar hospedagem Valencia (4 noites)", dueDate: "2026-03-20" },
    { category: "bookings", title: "Reservar hospedagem Barcelona (5 noites)", dueDate: "2026-03-20" },
    { category: "bookings", title: "Reservar hospedagem Málaga (4 noites)", dueDate: "2026-03-25" },
    { category: "bookings", title: "Reservar hospedagem Granada (3 noites)", dueDate: "2026-03-25" },
    { category: "bookings", title: "Reservar hospedagem Sevilla (4 noites)", dueDate: "2026-03-25" },
    { category: "bookings", title: "Reservar hospedagem Lisboa (4 noites)", dueDate: "2026-03-25" },
    { category: "bookings", title: "Comprar bilhetes Renfe (Madrid→Toledo, Toledo→Valencia, Valencia→Barcelona)", dueDate: "2026-04-01" },
    { category: "bookings", title: "Comprar voo Barcelona → Málaga", dueDate: "2026-04-01" },
    // Casa
    { category: "home", title: "Deixar chave com alguém de confiança", dueDate: "2026-04-18" },
    { category: "home", title: "Pagar contas pendentes", dueDate: "2026-04-18" },
  ];

  await Promise.all(
    checklistItems.map((item, i) =>
      prisma.checklistItem.create({
        data: {
          tripId: trip.id,
          category: item.category,
          title: item.title,
          dueDate: item.dueDate,
          isCompleted: false,
          sortOrder: i,
        },
      })
    )
  );

  // ── Tarefas ─────────────────────────────────────────────────
  const tasks = [
    { title: "Pesquisar voos GRU→MAD (abril)", priority: "high", category: "booking", dueDate: "2026-03-10" },
    { title: "Pesquisar voos LIS→GRU (maio)", priority: "high", category: "booking", dueDate: "2026-03-10" },
    { title: "Montar roteiro dia-a-dia Madrid", priority: "medium", category: "before_trip", dueDate: "2026-04-01", cityId: madrid.id },
    { title: "Pesquisar bairros para morar em Valencia", priority: "medium", category: "before_trip", dueDate: "2026-04-01", cityId: valencia.id },
    { title: "Pesquisar bairros para morar em Barcelona", priority: "medium", category: "before_trip", dueDate: "2026-04-01", cityId: barcelona.id },
    { title: "Pesquisar bairros para morar em Málaga", priority: "medium", category: "before_trip", dueDate: "2026-04-01", cityId: malaga.id },
    { title: "Comprar ingresso Alhambra (esgota rápido!)", priority: "urgent", category: "booking", dueDate: "2026-03-15", cityId: granada.id },
    { title: "Pesquisar coworkings nas cidades principais", priority: "low", category: "before_trip", dueDate: "2026-04-10" },
    { title: "Fazer lista de supermercados/apps de delivery locais", priority: "low", category: "before_trip", dueDate: "2026-04-15" },
    { title: "Pesquisar transporte público em cada cidade (passes)", priority: "medium", category: "transport", dueDate: "2026-04-10" },
  ];

  await Promise.all(
    tasks.map((t) =>
      prisma.task.create({
        data: {
          tripId: trip.id,
          title: t.title,
          priority: t.priority,
          category: t.category,
          dueDate: t.dueDate,
          cityId: t.cityId || null,
          status: "pending",
        },
      })
    )
  );

  // ── Métodos de pagamento ────────────────────────────────────
  await Promise.all([
    prisma.paymentMethod.create({
      data: {
        tripId: trip.id,
        name: "Cartão internacional",
        type: "debit_card",
        currency: "EUR",
        notes: "Principal para pagamentos do dia a dia.",
      },
    }),
    prisma.paymentMethod.create({
      data: {
        tripId: trip.id,
        name: "Dinheiro EUR",
        type: "cash",
        currency: "EUR",
        notes: "Reserva de emergência. ~200-300€.",
      },
    }),
    prisma.paymentMethod.create({
      data: {
        tripId: trip.id,
        name: "Cartão de crédito BR",
        type: "credit_card",
        currency: "BRL",
        notes: "Backup. IOF 6.38%.",
      },
    }),
  ]);

  console.log(`✅ Seed completo!`);
  console.log(`   Trip: ${trip.title} (${trip.id})`);
  console.log(`   ${cities.length} cidades`);
  console.log(`   9 segmentos`);
  console.log(`   ${checklistItems.length} items de checklist`);
  console.log(`   ${tasks.length} tarefas`);
  console.log(`   3 métodos de pagamento`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
