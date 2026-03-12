"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Senha incorreta");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8 shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Travel Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite a senha para acessar
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
