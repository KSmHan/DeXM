"use client";

import { useEffect, useMemo, useState } from "react";
import CompanyCard from "./CompanyCard";
import SeedImportButton from "./SeedImportButton";

export default function DashboardClient() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("Все");
  const [sector, setSector] = useState("Все");
  const [status, setStatus] = useState("Все");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/companies", { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось загрузить компании");
      setCompanies(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const priorities = useMemo(
    () => ["Все", ...Array.from(new Set(companies.map((c) => c.priority).filter(Boolean))).sort()],
    [companies]
  );
  const sectors = useMemo(
    () => ["Все", ...Array.from(new Set(companies.map((c) => c.sector).filter(Boolean))).sort()],
    [companies]
  );
  const statuses = useMemo(
    () => ["Все", ...Array.from(new Set(companies.map((c) => c.status).filter(Boolean))).sort()],
    [companies]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return companies
      .filter((c) => (priority === "Все" ? true : c.priority === priority))
      .filter((c) => (sector === "Все" ? true : c.sector === sector))
      .filter((c) => (status === "Все" ? true : c.status === status))
      .filter((c) => {
        if (!term) return true;
        return [c.name, c.city, c.state, c.sector, c.product, c.notes, c.targetContact]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term));
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [companies, q, priority, sector, status]);

  const stats = useMemo(() => {
    const byPriority = { A: 0, B: 0, C: 0 };
    for (const c of companies) {
      if (c.priority && byPriority[c.priority] !== undefined) byPriority[c.priority] += 1;
    }
    return { total: companies.length, ...byPriority };
  }, [companies]);

  return (
    <div>
      {!loading && companies.length === 0 && !error && <SeedImportButton onDone={load} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatTile label="Всего компаний" value={stats.total} />
        <StatTile label="Приоритет A" value={stats.A} accent />
        <StatTile label="Приоритет B" value={stats.B} />
        <StatTile label="Приоритет C" value={stats.C} />
      </div>

      <div className="bg-white border border-border rounded-xl p-3 mb-5 flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию, городу, сектору…"
          className="flex-1 min-w-[220px] rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-navy-light"
        />
        <Select label="Приоритет" value={priority} onChange={setPriority} options={priorities} />
        <Select label="Сектор" value={sector} onChange={setSector} options={sectors} />
        <Select label="Статус" value={status} onChange={setStatus} options={statuses} />
        <button
          onClick={load}
          className="text-sm text-navy hover:text-gold border border-border rounded-lg px-3 py-2 transition"
        >
          Обновить
        </button>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted text-sm">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p>Компании не найдены.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className={`text-2xl font-semibold ${accent ? "text-gold" : "text-navy"}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm rounded-lg border border-border px-2.5 py-2 outline-none focus:border-navy-light bg-white"
      aria-label={label}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
