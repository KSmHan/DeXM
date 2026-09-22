"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось войти");
        return;
      }
      router.replace(params.get("next") || "/");
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-navy-deep px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="DeXM" width={64} height={64} className="rounded-md" />
          <h1 className="mt-4 text-2xl font-semibold text-cream tracking-tight">DeXM CRM</h1>
          <p className="mt-1 text-sm text-white/50">Учёт компаний и документов по сделкам</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-navy rounded-xl border border-white/10 shadow-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Пароль</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2.5 text-cream placeholder-white/30 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
              placeholder="Введите пароль доступа"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold hover:bg-gold-light disabled:opacity-60 text-navy-deep font-semibold py-2.5 transition"
          >
            {loading ? "Проверка…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
