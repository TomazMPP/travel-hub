"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  Shield,
  ShieldCheck,
  Plane,
  Hotel,
  CreditCard,
  Ticket,
  Car,
  BookOpen,
  ClipboardList,
  MoreHorizontal,
  AlertTriangle,
  Star,
  X,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DOCUMENT_TYPES } from "@/lib/constants";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/app/actions/documents";

// Icons for each document type
const documentTypeIcons: Record<string, React.ElementType> = {
  passport: Plane,
  cnh: Car,
  pid: FileText,
  travel_insurance: ShieldCheck,
  accommodation_proof: Hotel,
  ticket: Ticket,
  booking: BookOpen,
  financial_proof: CreditCard,
  personal_checklist: ClipboardList,
  other: MoreHorizontal,
};

// Critical types for border/airport mode
const BORDER_MODE_TYPES = [
  "passport",
  "travel_insurance",
  "accommodation_proof",
  "ticket",
  "financial_proof",
];

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getExpiryStatus(expiresAt: string | null | undefined): "ok" | "warning" | "expired" | null {
  if (!expiresAt) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt + "T00:00:00");
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "warning";
  return "ok";
}

function getExpiryLabel(status: "ok" | "warning" | "expired" | null, expiresAt: string | null | undefined) {
  if (!status || !expiresAt) return null;
  const expiry = new Date(expiresAt + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (status === "expired") return `Expirado há ${Math.abs(diffDays)} dias`;
  if (status === "warning") return `Expira em ${diffDays} dias`;
  return null;
}

interface Document {
  id: string;
  tripId: string;
  documentType: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  isCritical: boolean;
  tags: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Trip {
  id: string;
  title: string;
}

export function DocumentsPage({
  trip,
  documents,
}: {
  trip: Trip;
  documents: Document[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [borderMode, setBorderMode] = useState(false);
  const [isCriticalChecked, setIsCriticalChecked] = useState(false);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (filterType && doc.documentType !== filterType) return false;
    return true;
  });

  // Border mode documents: only critical travel docs
  const borderDocuments = documents.filter(
    (doc) =>
      BORDER_MODE_TYPES.includes(doc.documentType) || doc.isCritical
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = {
        documentType: (fd.get("documentType") as string) || "other",
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        fileUrl: (fd.get("fileUrl") as string) || undefined,
        issuedAt: (fd.get("issuedAt") as string) || undefined,
        expiresAt: (fd.get("expiresAt") as string) || undefined,
        isCritical: isCriticalChecked,
        tags: (fd.get("tags") as string) || undefined,
      };

      if (editing) {
        await updateDocument(editing.id, data);
      } else {
        await createDocument({ tripId: trip.id, ...data });
      }
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  // ── BORDER MODE (full-screen) ──────────────────────────────
  if (borderMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-primary-foreground hover:bg-primary/80"
            onClick={() => setBorderMode(false)}
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7" />
            <h1 className="text-xl font-bold">Modo Fronteira</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-primary-foreground hover:bg-primary/80"
            onClick={() => setBorderMode(false)}
          >
            <X className="h-7 w-7" />
          </Button>
        </div>

        {/* Documents grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {borderDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <Shield className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nenhum documento de fronteira cadastrado.
              </p>
              <p className="text-sm text-muted-foreground">
                Adicione passaporte, seguro viagem, comprovantes de hospedagem,
                passagens ou comprovantes financeiros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {borderDocuments.map((doc) => {
                const Icon = documentTypeIcons[doc.documentType] || FileText;
                const typeLabel =
                  DOCUMENT_TYPES.find((t) => t.value === doc.documentType)
                    ?.label || doc.documentType;
                const expiryStatus = getExpiryStatus(doc.expiresAt);

                return (
                  <Card
                    key={doc.id}
                    className={`border-2 ${
                      expiryStatus === "expired"
                        ? "border-red-500 bg-red-500/5"
                        : expiryStatus === "warning"
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-primary/30"
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Large icon + type */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Badge variant="outline" className="text-sm mb-1">
                            {typeLabel}
                          </Badge>
                          <h3 className="text-lg font-bold leading-tight truncate">
                            {doc.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                      )}

                      {/* Expiry */}
                      {doc.expiresAt && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                            expiryStatus === "expired"
                              ? "bg-red-500/10 text-red-500"
                              : expiryStatus === "warning"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-5 w-5 shrink-0" />
                          <span>Validade: {formatDate(doc.expiresAt)}</span>
                        </div>
                      )}

                      {/* File URL */}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block"
                        >
                          <Button
                            variant="outline"
                            className="w-full h-14 text-base"
                          >
                            <FileText className="h-5 w-5 mr-2" />
                            Abrir Documento
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── NORMAL MODE ────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Documentos ({documents.length})
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setBorderMode(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            Modo Fronteira
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsCriticalChecked(false);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="flex h-9 w-full sm:w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">Todos os tipos</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expiry warnings summary */}
      {(() => {
        const expiredDocs = documents.filter(
          (d) => getExpiryStatus(d.expiresAt) === "expired"
        );
        const warningDocs = documents.filter(
          (d) => getExpiryStatus(d.expiresAt) === "warning"
        );
        if (expiredDocs.length === 0 && warningDocs.length === 0) return null;
        return (
          <div className="space-y-1">
            {expiredDocs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-md p-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {expiredDocs.length} documento(s) expirado(s)!
              </div>
            )}
            {warningDocs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 rounded-md p-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {warningDocs.length} documento(s) expirando em breve
              </div>
            )}
          </div>
        );
      })()}

      {/* Documents grid */}
      {filteredDocuments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {filterType
            ? "Nenhum documento encontrado com esse filtro."
            : "Nenhum documento adicionado ainda."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDocuments.map((doc) => {
            const Icon = documentTypeIcons[doc.documentType] || FileText;
            const typeLabel =
              DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label ||
              doc.documentType;
            const expiryStatus = getExpiryStatus(doc.expiresAt);
            const expiryLabel = getExpiryLabel(expiryStatus, doc.expiresAt);
            const tags = doc.tags
              ? doc.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <Card
                key={doc.id}
                className={`transition-colors ${
                  expiryStatus === "expired"
                    ? "border-red-500/50"
                    : expiryStatus === "warning"
                    ? "border-orange-500/50"
                    : doc.isCritical
                    ? "border-primary/30"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  {/* Top row: icon + title + critical star */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {doc.isCritical && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                        <h3 className="font-semibold text-sm truncate">
                          {doc.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs mt-0.5">
                        {typeLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(doc);
                          setIsCriticalChecked(doc.isCritical);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={async () => {
                          if (confirm(`Excluir "${doc.title}"?`)) {
                            await deleteDocument(doc.id);
                            router.refresh();
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  {/* Dates row */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {doc.issuedAt && <span>Emissão: {formatDate(doc.issuedAt)}</span>}
                    {doc.expiresAt && (
                      <span
                        className={
                          expiryStatus === "expired"
                            ? "text-red-500 font-medium"
                            : expiryStatus === "warning"
                            ? "text-orange-500 font-medium"
                            : ""
                        }
                      >
                        Validade: {formatDate(doc.expiresAt)}
                      </span>
                    )}
                  </div>

                  {/* Expiry warning label */}
                  {expiryLabel && (
                    <div
                      className={`flex items-center gap-1.5 mt-2 text-xs font-medium rounded px-2 py-1 ${
                        expiryStatus === "expired"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {expiryLabel}
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* File link */}
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      <FileText className="h-3 w-3" />
                      Ver arquivo
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Documento" : "Novo Documento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title}
                required
                placeholder="Ex: Passaporte Brasil"
              />
            </div>

            <div>
              <Label htmlFor="documentType">Tipo de documento</Label>
              <select
                id="documentType"
                name="documentType"
                defaultValue={editing?.documentType || "other"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing?.description || ""}
                placeholder="Detalhes adicionais..."
              />
            </div>

            <div>
              <Label htmlFor="fileUrl">URL do arquivo</Label>
              <Input
                id="fileUrl"
                name="fileUrl"
                type="url"
                defaultValue={editing?.fileUrl || ""}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="issuedAt">Data de emissao</Label>
                <Input
                  id="issuedAt"
                  name="issuedAt"
                  type="date"
                  defaultValue={editing?.issuedAt || ""}
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Data de validade</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  defaultValue={editing?.expiresAt || ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por virgula)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={editing?.tags || ""}
                placeholder="Ex: europa, original, copia"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isCritical"
                checked={isCriticalChecked}
                onCheckedChange={(checked) => setIsCriticalChecked(!!checked)}
              />
              <Label htmlFor="isCritical" className="text-sm font-normal cursor-pointer">
                Documento critico (aparece no Modo Fronteira)
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
