"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { upsertReview } from "@/app/actions/reviews";

interface CityReview {
  id: string;
  tripId: string;
  cityId: string;
  costScore: number | null;
  safetyScore: number | null;
  beautyScore: number | null;
  climateScore: number | null;
  transportScore: number | null;
  lifestyleScore: number | null;
  wouldLiveHere: boolean;
  pros: string | null;
  cons: string | null;
  finalNotes: string | null;
  city: { id: string; name: string; country: string | null };
}

interface City {
  id: string;
  name: string;
  country?: string | null;
}

const SCORE_FIELDS = [
  { key: "costScore" as const, label: "Custo" },
  { key: "safetyScore" as const, label: "Seguranca" },
  { key: "beautyScore" as const, label: "Beleza" },
  { key: "climateScore" as const, label: "Clima" },
  { key: "transportScore" as const, label: "Transporte" },
  { key: "lifestyleScore" as const, label: "Estilo de vida" },
];

type ScoreKey = (typeof SCORE_FIELDS)[number]["key"];

function scoreColor(val: number): string {
  if (val >= 8) return "bg-green-500";
  if (val >= 6) return "bg-blue-500";
  if (val >= 4) return "bg-yellow-500";
  return "bg-red-500";
}

function calcAvg(review: CityReview): number {
  const scores = SCORE_FIELDS.map((f) => review[f.key]).filter((v): v is number => v !== null);
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function ReviewsPage({
  tripId,
  reviews,
  cities,
}: {
  tripId: string;
  reviews: CityReview[];
  cities: City[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingScore, setEditingScore] = useState<{
    cityId: string;
    field: ScoreKey;
  } | null>(null);
  const [scoreInput, setScoreInput] = useState("");

  // Build a map of cityId -> review
  const reviewMap = useMemo(() => {
    const map = new Map<string, CityReview>();
    for (const r of reviews) map.set(r.cityId, r);
    return map;
  }, [reviews]);

  // Sorted cities with averages for comparison table
  const citiesWithAvg = useMemo(() => {
    return cities
      .map((c) => {
        const review = reviewMap.get(c.id);
        return {
          city: c,
          review,
          avg: review ? calcAvg(review) : 0,
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [cities, reviewMap]);

  async function handleScoreChange(cityId: string, field: ScoreKey, value: number) {
    if (value < 1 || value > 10) return;
    setLoading(true);
    await upsertReview({ tripId, cityId, [field]: value });
    setEditingScore(null);
    setScoreInput("");
    setLoading(false);
    router.refresh();
  }

  async function handleToggleLive(cityId: string, current: boolean) {
    setLoading(true);
    await upsertReview({ tripId, cityId, wouldLiveHere: !current });
    setLoading(false);
    router.refresh();
  }

  async function handleTextSave(
    cityId: string,
    field: "pros" | "cons" | "finalNotes",
    value: string
  ) {
    setLoading(true);
    await upsertReview({ tripId, cityId, [field]: value });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5" />
        <span className="font-semibold">Avaliações das Cidades</span>
        <span className="text-sm text-muted-foreground ml-auto">
          {reviews.length}/{cities.length} avaliadas
        </span>
      </div>

      {/* Comparison Table */}
      {citiesWithAvg.some((c) => c.avg > 0) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Comparativo</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1.5 pr-3 font-medium">Cidade</th>
                    {SCORE_FIELDS.map((f) => (
                      <th key={f.key} className="text-center py-1.5 px-2 font-medium text-xs">
                        {f.label}
                      </th>
                    ))}
                    <th className="text-center py-1.5 px-2 font-medium">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {citiesWithAvg
                    .filter((c) => c.avg > 0)
                    .map(({ city, review, avg }) => (
                      <tr key={city.id} className="border-b last:border-0">
                        <td className="py-1.5 pr-3 flex items-center gap-1.5">
                          {review?.wouldLiveHere && (
                            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                          )}
                          <span className="font-medium">{city.name}</span>
                        </td>
                        {SCORE_FIELDS.map((f) => (
                          <td key={f.key} className="text-center py-1.5 px-2">
                            <span className="text-xs">
                              {review?.[f.key] ?? "-"}
                            </span>
                          </td>
                        ))}
                        <td className="text-center py-1.5 px-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-semibold"
                          >
                            {avg.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Review Cards */}
      {cities.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma cidade adicionada a esta viagem.
        </p>
      ) : (
        <div className="space-y-4">
          {cities.map((city) => {
            const review = reviewMap.get(city.id);
            const avg = review ? calcAvg(review) : 0;

            return (
              <Card key={city.id}>
                <CardContent className="p-4 space-y-4">
                  {/* City Header */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{city.name}</h3>
                    {city.country && (
                      <span className="text-sm text-muted-foreground">{city.country}</span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      {avg > 0 && (
                        <Badge className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {avg.toFixed(1)}
                        </Badge>
                      )}
                      <button
                        onClick={() => handleToggleLive(city.id, review?.wouldLiveHere ?? false)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Moraria aqui?"
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            review?.wouldLiveHere
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="grid gap-2">
                    {SCORE_FIELDS.map((field) => {
                      const val = review?.[field.key] ?? 0;
                      const isEditing =
                        editingScore?.cityId === city.id &&
                        editingScore?.field === field.key;

                      return (
                        <div key={field.key} className="flex items-center gap-3">
                          <span className="text-xs w-24 shrink-0 text-muted-foreground">
                            {field.label}
                          </span>
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setEditingScore({ cityId: city.id, field: field.key });
                              setScoreInput(val > 0 ? String(val) : "");
                            }}
                          >
                            {isEditing ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const n = parseInt(scoreInput);
                                  if (n >= 1 && n <= 10) {
                                    handleScoreChange(city.id, field.key, n);
                                  }
                                }}
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={scoreInput}
                                  onChange={(e) => setScoreInput(e.target.value)}
                                  className="h-7 w-16 text-xs"
                                  autoFocus
                                  onBlur={() => {
                                    const n = parseInt(scoreInput);
                                    if (n >= 1 && n <= 10) {
                                      handleScoreChange(city.id, field.key, n);
                                    } else {
                                      setEditingScore(null);
                                      setScoreInput("");
                                    }
                                  }}
                                />
                                <span className="text-[10px] text-muted-foreground">1-10</span>
                              </form>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${val > 0 ? scoreColor(val) : ""}`}
                                    style={{ width: `${val * 10}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium w-6 text-right">
                                  {val > 0 ? val : "-"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pros / Cons / Notes */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Pontos positivos</Label>
                      <Textarea
                        rows={2}
                        placeholder="O que gostou..."
                        defaultValue={review?.pros ?? ""}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val !== (review?.pros ?? "")) {
                            handleTextSave(city.id, "pros", val);
                          }
                        }}
                        className="text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Pontos negativos</Label>
                      <Textarea
                        rows={2}
                        placeholder="O que nao gostou..."
                        defaultValue={review?.cons ?? ""}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val !== (review?.cons ?? "")) {
                            handleTextSave(city.id, "cons", val);
                          }
                        }}
                        className="text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Notas finais</Label>
                    <Textarea
                      rows={2}
                      placeholder="Observacoes gerais..."
                      defaultValue={review?.finalNotes ?? ""}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== (review?.finalNotes ?? "")) {
                          handleTextSave(city.id, "finalNotes", val);
                        }
                      }}
                      className="text-sm mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
