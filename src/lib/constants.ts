export const TRIP_STATUSES = [
  { value: "planning", label: "Planejando", color: "bg-blue-500" },
  { value: "confirmed", label: "Confirmada", color: "bg-green-500" },
  { value: "ongoing", label: "Em andamento", color: "bg-yellow-500" },
  { value: "finished", label: "Finalizada", color: "bg-gray-500" },
  { value: "archived", label: "Arquivada", color: "bg-gray-400" },
] as const;

export const TRANSPORT_TYPES = [
  { value: "flight", label: "Avião", icon: "Plane" },
  { value: "train", label: "Trem", icon: "Train" },
  { value: "bus", label: "Ônibus", icon: "Bus" },
  { value: "car", label: "Carro", icon: "Car" },
  { value: "walk", label: "A pé", icon: "Footprints" },
  { value: "ferry", label: "Balsa", icon: "Ship" },
  { value: "other", label: "Outro", icon: "MoreHorizontal" },
] as const;

export const ITINERARY_CATEGORIES = [
  { value: "tour", label: "Passeio", icon: "Camera" },
  { value: "food", label: "Alimentação", icon: "UtensilsCrossed" },
  { value: "museum", label: "Museu", icon: "Landmark" },
  { value: "walk", label: "Caminhada", icon: "Footprints" },
  { value: "shopping", label: "Compras", icon: "ShoppingBag" },
  { value: "admin", label: "Administrativo", icon: "FileText" },
  { value: "rest", label: "Descanso", icon: "Coffee" },
  { value: "transport", label: "Transporte", icon: "Train" },
  { value: "other", label: "Outro", icon: "MoreHorizontal" },
] as const;

export const BOOKING_TYPES = [
  { value: "accommodation", label: "Hospedagem", icon: "Hotel" },
  { value: "flight", label: "Voo", icon: "Plane" },
  { value: "train", label: "Trem", icon: "Train" },
  { value: "bus", label: "Ônibus", icon: "Bus" },
  { value: "car_rental", label: "Aluguel de Carro", icon: "Car" },
  { value: "ticket", label: "Ingresso", icon: "Ticket" },
  { value: "restaurant", label: "Restaurante", icon: "UtensilsCrossed" },
  { value: "insurance", label: "Seguro", icon: "Shield" },
  { value: "other", label: "Outro", icon: "MoreHorizontal" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passaporte" },
  { value: "cnh", label: "CNH" },
  { value: "pid", label: "PID" },
  { value: "travel_insurance", label: "Seguro Viagem" },
  { value: "accommodation_proof", label: "Comprovante Hospedagem" },
  { value: "ticket", label: "Passagem" },
  { value: "booking", label: "Reserva" },
  { value: "financial_proof", label: "Comprovante Financeiro" },
  { value: "personal_checklist", label: "Checklist Pessoal" },
  { value: "other", label: "Outro" },
] as const;

export const CHECKLIST_CATEGORIES = [
  { value: "documents", label: "Documentos", icon: "FileText" },
  { value: "financial", label: "Financeiro", icon: "DollarSign" },
  { value: "luggage", label: "Bagagem", icon: "Luggage" },
  { value: "health", label: "Saúde", icon: "Heart" },
  { value: "tech", label: "Tecnologia", icon: "Laptop" },
  { value: "bookings", label: "Reservas", icon: "CalendarCheck" },
  { value: "transport", label: "Transporte", icon: "Train" },
  { value: "home", label: "Casa", icon: "Home" },
  { value: "other", label: "Outros", icon: "MoreHorizontal" },
] as const;

export const BAG_TYPES = [
  { value: "main_suitcase", label: "Mala Principal" },
  { value: "backpack", label: "Mochila" },
  { value: "document_folder", label: "Pasta de Documentos" },
  { value: "on_body", label: "No Corpo" },
] as const;

export const PACKING_CATEGORIES = [
  { value: "clothes", label: "Roupas" },
  { value: "hygiene", label: "Higiene" },
  { value: "electronics", label: "Eletrônicos" },
  { value: "medicine", label: "Remédios" },
  { value: "documents", label: "Documentos" },
  { value: "accessories", label: "Acessórios" },
  { value: "cold_weather", label: "Clima Frio" },
  { value: "beach", label: "Praia" },
  { value: "other", label: "Outros" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "accommodation", label: "Hospedagem" },
  { value: "transport", label: "Transporte" },
  { value: "food", label: "Alimentação" },
  { value: "tickets", label: "Ingressos" },
  { value: "shopping", label: "Compras" },
  { value: "insurance", label: "Seguro" },
  { value: "internet", label: "Chip/Internet" },
  { value: "laundry", label: "Lavanderia" },
  { value: "emergency", label: "Emergência" },
  { value: "other", label: "Outros" },
] as const;

export const CONTACT_TYPES = [
  { value: "friend", label: "Amigo" },
  { value: "hotel", label: "Hotel" },
  { value: "host", label: "Anfitrião" },
  { value: "rental", label: "Locadora" },
  { value: "insurance", label: "Seguro" },
  { value: "emergency", label: "Emergência" },
  { value: "transport", label: "Transporte" },
  { value: "restaurant", label: "Restaurante" },
  { value: "other", label: "Outro" },
] as const;

export const LINK_CATEGORIES = [
  { value: "maps", label: "Mapas" },
  { value: "booking", label: "Reserva" },
  { value: "restaurant", label: "Restaurante" },
  { value: "tickets", label: "Ingressos" },
  { value: "transport", label: "Transporte" },
  { value: "government", label: "Governo" },
  { value: "weather", label: "Clima" },
  { value: "other", label: "Outros" },
] as const;

export const TASK_PRIORITIES = [
  { value: "low", label: "Baixa", color: "bg-gray-400" },
  { value: "medium", label: "Média", color: "bg-blue-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "urgent", label: "Urgente", color: "bg-red-500" },
] as const;

export const TASK_CATEGORIES = [
  { value: "before_trip", label: "Antes da viagem" },
  { value: "during_trip", label: "Durante a viagem" },
  { value: "documents", label: "Documentos" },
  { value: "financial", label: "Financeiro" },
  { value: "booking", label: "Reserva" },
  { value: "transport", label: "Transporte" },
  { value: "personal", label: "Pessoal" },
] as const;

export const PAYMENT_METHOD_TYPES = [
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "account", label: "Conta Digital" },
] as const;
