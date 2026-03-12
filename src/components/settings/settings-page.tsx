"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRIP_STATUSES } from "@/lib/constants";
import { updateTrip } from "@/app/actions/trips";

interface Trip {
  id: string;
  title: string;
  country: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
  status: string;
  notes: string | null;
  timezone: string;
  dateFormat: string;
  departureFromHome: string | null;
  returnHome: string | null;
}

export function SettingsPage({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    await updateTrip(trip.id, {
      title: fd.get("title") as string,
      country: (fd.get("country") as string) || undefined,
      startDate: (fd.get("startDate") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined,
      baseCurrency: fd.get("baseCurrency") as string,
      status: fd.get("status") as string,
      timezone: fd.get("timezone") as string,
      dateFormat: fd.get("dateFormat") as string,
      departureFromHome: (fd.get("departureFromHome") as string) || undefined,
      returnHome: (fd.get("returnHome") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    });

    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Configurações da Viagem</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-5 space-y-5">
            <div>
              <Label htmlFor="title">Nome da viagem *</Label>
              <Input id="title" name="title" defaultValue={trip.title} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">País / Região</Label>
                <Input id="country" name="country" defaultValue={trip.country || ""} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={trip.status}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {TRIP_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data início</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={trip.startDate || ""} />
              </div>
              <div>
                <Label htmlFor="endDate">Data fim</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={trip.endDate || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureFromHome">Partida do Brasil</Label>
                <Input id="departureFromHome" name="departureFromHome" type="date" defaultValue={trip.departureFromHome || ""} />
              </div>
              <div>
                <Label htmlFor="returnHome">Retorno</Label>
                <Input id="returnHome" name="returnHome" type="date" defaultValue={trip.returnHome || ""} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="baseCurrency">Moeda base</Label>
                <select id="baseCurrency" name="baseCurrency" defaultValue={trip.baseCurrency}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="BRL">BRL</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">Fuso horário</Label>
                <select id="timezone" name="timezone" defaultValue={trip.timezone}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="America/Sao_Paulo">São Paulo</option>
                  <option value="Europe/Madrid">Madrid</option>
                  <option value="Europe/London">Londres</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Europe/Rome">Roma</option>
                  <option value="Europe/Lisbon">Lisboa</option>
                  <option value="America/New_York">Nova York</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Formato de data</Label>
                <select id="dateFormat" name="dateFormat" defaultValue={trip.dateFormat}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas gerais</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={trip.notes || ""} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : saved ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
