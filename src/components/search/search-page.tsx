"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Hotel,
  Calendar,
  FileText,
  StickyNote,
  Users,
  ListTodo,
  Link2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { globalSearch, type SearchResult } from "@/app/actions/search";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  city: { label: "Cidade", icon: MapPin, color: "text-green-500" },
  booking: { label: "Reserva", icon: Hotel, color: "text-cyan-500" },
  itinerary: { label: "Itinerário", icon: Calendar, color: "text-purple-500" },
  document: { label: "Documento", icon: FileText, color: "text-orange-500" },
  note: { label: "Nota", icon: StickyNote, color: "text-yellow-500" },
  contact: { label: "Contato", icon: Users, color: "text-blue-500" },
  task: { label: "Tarefa", icon: ListTodo, color: "text-red-500" },
  link: { label: "Link", icon: Link2, color: "text-teal-500" },
};

export function SearchPage({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      const res = await globalSearch(tripId, q);
      setResults(res);
      setSearched(true);
      setLoading(false);
    },
    [tripId]
  );

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar em tudo: cidades, reservas, notas, tarefas..."
          className="pl-10 h-11 text-base"
          autoFocus
        />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum resultado encontrado para &ldquo;{query}&rdquo;
        </p>
      )}

      {Object.entries(grouped).map(([type, typeResults]) => {
        const config = typeConfig[type] || { label: type, icon: Search, color: "" };
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <config.icon className={`h-4 w-4 ${config.color}`} />
              <span className="text-sm font-semibold">{config.label}</span>
              <Badge variant="outline" className="text-[10px]">{typeResults.length}</Badge>
            </div>
            <div className="space-y-2">
              {typeResults.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => router.push(result.url)}
                >
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {!searched && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
          <p className="text-xs mt-1">Busca em cidades, reservas, documentos, notas, contatos, tarefas e links</p>
        </div>
      )}
    </div>
  );
}
