"use client";

import { useState } from "react";

const SCORE_FIELDS = [
  ["ownerAge", "Возраст владельца"],
  ["succession", "Преемственность"],
  ["ownershipTenureScore", "Срок владения"],
  ["familyInvolvement", "Участие семьи"],
  ["externalCeo", "Внешний CEO/президент"],
  ["interviewLanguage", "Формулировки в интервью"],
  ["capex", "Капзатраты/расширение"],
  ["ownershipChanges", "Изменения владения"],
  ["peMinority", "PE/миноритарный инвестор"],
  ["strategicPressure", "Стратегическое давление"],
];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-navy-light bg-white";

export default function CompanyForm({ initial = {}, onSubmit, submitLabel = "Сохранить", onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    priority: initial.priority || "",
    score: initial.score ?? "",
    city: initial.city || "",
    state: initial.state || "",
    sector: initial.sector || "",
    product: initial.product || "",
    ownershipTenure: initial.ownershipTenure || "",
    rationale: initial.rationale || "",
    estRevenue: initial.estRevenue || "",
    employees: initial.employees || "",
    targetContact: initial.targetContact || "",
    nextStep: initial.nextStep || "",
    sourceUrl: initial.sourceUrl || "",
    nearbyNY: initial.nearbyNY || "",
    status: initial.status || "",
    notes: initial.notes || "",
    triggerOverride: initial.triggerOverride || "",
    scores: initial.scores || {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setScore(key, value) {
    setForm((f) => ({ ...f, scores: { ...f.scores, [key]: value === "" ? "" : Number(value) } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Укажите название компании");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        score: form.score === "" ? null : Number(form.score),
      });
    } catch (err) {
      setError(err.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Название компании *">
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Приоритет (A/B/C)">
            <input className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value)} maxLength={1} />
          </Field>
          <Field label="Балл (Score)">
            <input type="number" className={inputCls} value={form.score} onChange={(e) => set("score", e.target.value)} />
          </Field>
        </div>
        <Field label="Город">
          <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Штат">
          <input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="Сектор">
          <input className={inputCls} value={form.sector} onChange={(e) => set("sector", e.target.value)} />
        </Field>
        <Field label="Продукт / Направление">
          <input className={inputCls} value={form.product} onChange={(e) => set("product", e.target.value)} />
        </Field>
        <Field label="Владение / Срок">
          <input className={inputCls} value={form.ownershipTenure} onChange={(e) => set("ownershipTenure", e.target.value)} />
        </Field>
        <Field label="Рядом с Нью-Йорком?">
          <input className={inputCls} value={form.nearbyNY} onChange={(e) => set("nearbyNY", e.target.value)} placeholder="YES / NO" />
        </Field>
        <Field label="Выручка (оценка)">
          <input className={inputCls} value={form.estRevenue} onChange={(e) => set("estRevenue", e.target.value)} />
        </Field>
        <Field label="Сотрудники">
          <input className={inputCls} value={form.employees} onChange={(e) => set("employees", e.target.value)} />
        </Field>
        <Field label="Контактное лицо">
          <input className={inputCls} value={form.targetContact} onChange={(e) => set("targetContact", e.target.value)} />
        </Field>
        <Field label="Статус">
          <input className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)} />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Field label="Обоснование сделки">
          <textarea className={inputCls} rows={2} value={form.rationale} onChange={(e) => set("rationale", e.target.value)} />
        </Field>
        <Field label="Следующий шаг / контакт">
          <input className={inputCls} value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} />
        </Field>
        <Field label="Источник (URL)">
          <input className={inputCls} value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
        </Field>
        <Field label="Триггер (особые события)">
          <input className={inputCls} value={form.triggerOverride} onChange={(e) => set("triggerOverride", e.target.value)} />
        </Field>
        <Field label="Заметки">
          <textarea className={inputCls} rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </section>

      <section>
        <p className="text-xs font-medium text-muted mb-2">Скоринговые баллы (0–2)</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SCORE_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="number"
                min={0}
                max={2}
                className={inputCls}
                value={form.scores[key] ?? ""}
                onChange={(e) => setScore(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-navy hover:bg-navy-light text-white font-medium rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-60"
        >
          {saving ? "Сохранение…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted hover:text-ink px-4 py-2.5"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
