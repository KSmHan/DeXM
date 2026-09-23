"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const FIELD_ALIASES = {
  priority: "priority",
  score: "score",
  company: "name",
  companyname: "name",
  name: "name",
  city: "city",
  state: "state",
  sector: "sector",
  product: "product",
  ownershiptenure: "ownershipTenure",
  rationale: "rationale",
  estrevenue: "estRevenue",
  estimatedrevenue: "estRevenue",
  revenue: "estRevenue",
  employees: "employees",
  targetcontact: "targetContact",
  contact: "targetContact",
  nextstep: "nextStep",
  sourceurl: "sourceUrl",
  source: "sourceUrl",
  url: "sourceUrl",
  nearbyny: "nearbyNY",
  status: "status",
  notes: "notes",
  triggeroverride: "triggerOverride",
};

function normalizeKey(k) {
  return String(k || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function rowToCompany(row) {
  const company = {};
  for (const [key, value] of Object.entries(row)) {
    const field = FIELD_ALIASES[normalizeKey(key)];
    if (!field || value === undefined || value === "") continue;
    company[field] = field === "score" ? Number(value) || 0 : String(value).trim();
  }
  return company;
}

export default function BulkImportButton({ onDone }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    setSuccess("");
    setProgress({ done: 0, total: 0 });
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const companies = rows.map(rowToCompany).filter((c) => c.name);
      if (!companies.length) {
        throw new Error("В файле не найдено ни одной компании с заполненным названием");
      }
      setProgress({ done: 0, total: companies.length });
      for (let i = 0; i < companies.length; i++) {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companies[i]),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Ошибка на строке ${i + 1} («${companies[i].name}»)`);
        }
        setProgress({ done: i + 1, total: companies.length });
      }
      setSuccess(`Добавлено компаний: ${companies.length}`);
      onDone?.();
    } catch (e) {
      setError(e.message || "Не удалось загрузить файл");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-ink font-medium">Массовая загрузка компаний</p>
          <p className="text-xs text-muted mt-0.5">
            Excel (.xlsx, .xls) или CSV со списком компаний — все строки добавятся сразу
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 bg-navy hover:bg-navy-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition"
        >
          {busy ? `Загрузка… ${progress.done}/${progress.total}` : "Загрузить список компаний"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
      {success && !error && <p className="text-sm text-emerald-600 mt-3">{success}</p>}
    </div>
  );
}
