"use client";

import { useState } from "react";
import seedCompanies from "@/data/seedCompanies.json";

export default function SeedImportButton({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function runImport() {
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      for (let i = 0; i < seedCompanies.length; i++) {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seedCompanies[i]),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Ошибка на компании ${i + 1}`);
        }
        setProgress(i + 1);
      }
      onDone?.();
    } catch (e) {
      setError(e.message || "Не удалось загрузить компании");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6 text-center mb-6">
      <p className="text-sm text-ink font-medium mb-1">
        Компаний пока нет — загрузите первую партию из Acquisition Pipeline
      </p>
      <p className="text-xs text-muted mb-4">{seedCompanies.length} компаний из исходной таблицы</p>
      <button
        onClick={runImport}
        disabled={busy}
        className="bg-gold hover:bg-gold-light disabled:opacity-60 text-navy-deep font-semibold rounded-lg px-4 py-2.5 text-sm transition"
      >
        {busy ? `Загрузка… ${progress}/${seedCompanies.length}` : `Загрузить ${seedCompanies.length} компаний`}
      </button>
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
    </div>
  );
}
