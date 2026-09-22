"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PriorityBadge from "@/components/PriorityBadge";
import StatusPill from "@/components/StatusPill";
import CompanyForm from "@/components/CompanyForm";
import DocumentsPanel from "@/components/DocumentsPanel";

const SCORE_LABELS = {
  ownerAge: "Возраст владельца",
  succession: "Преемственность",
  ownershipTenureScore: "Срок владения",
  familyInvolvement: "Участие семьи",
  externalCeo: "Внешний CEO/президент",
  interviewLanguage: "Формулировки в интервью",
  capex: "Капзатраты/расширение",
  ownershipChanges: "Изменения владения",
  peMinority: "PE/миноритарный инвестор",
  strategicPressure: "Стратегическое давление",
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-border last:border-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export default function CompanyDetailPage({ params }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Компания не найдена");
      setCompany(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data) {
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Не удалось сохранить");
    setCompany(result);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Удалить компанию «${company.name}» и все её документы?`)) return;
    const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/");
  }

  if (loading) return <p className="text-muted text-sm">Загрузка…</p>;
  if (error || !company) {
    return (
      <div>
        <p className="text-danger mb-4">{error || "Компания не найдена"}</p>
        <Link href="/" className="text-navy hover:underline text-sm">
          ← Назад к списку
        </Link>
      </div>
    );
  }

  const scoreEntries = Object.entries(company.scores || {}).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  );

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/" className="text-sm text-muted hover:text-navy">
        ← Назад к списку
      </Link>

      {editing ? (
        <div className="mt-4 bg-white border border-border rounded-xl p-6">
          <h1 className="text-lg font-semibold mb-4">Редактирование: {company.name}</h1>
          <CompanyForm
            initial={company}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel="Сохранить изменения"
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <PriorityBadge priority={company.priority} />
              <div>
                <h1 className="text-2xl font-semibold text-ink">{company.name}</h1>
                <p className="text-sm text-muted mt-0.5">
                  {[company.city, company.state].filter(Boolean).join(", ")}
                  {company.sector ? ` · ${company.sector}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-sm bg-navy hover:bg-navy-light text-white rounded-lg px-3.5 py-2 transition"
              >
                Редактировать
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-danger border border-red-200 hover:bg-red-50 rounded-lg px-3.5 py-2 transition"
              >
                Удалить
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <StatusPill status={company.status} />
            {typeof company.score === "number" && (
              <span className="text-xs text-muted">Балл приоритета: {company.score}</span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-2">Основное</h2>
                <dl>
                  <InfoRow label="Продукт / Направление" value={company.product} />
                  <InfoRow label="Владение / Срок" value={company.ownershipTenure} />
                  <InfoRow label="Обоснование сделки" value={company.rationale} />
                  <InfoRow label="Оценка выручки" value={company.estRevenue} />
                  <InfoRow label="Сотрудники" value={company.employees} />
                  <InfoRow label="Рядом с Нью-Йорком" value={company.nearbyNY} />
                  <InfoRow label="Триггер" value={company.triggerOverride} />
                </dl>
              </section>

              <section className="bg-white border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-2">Контакт и следующий шаг</h2>
                <dl>
                  <InfoRow label="Контактное лицо" value={company.targetContact} />
                  <InfoRow label="Следующий шаг" value={company.nextStep} />
                  <InfoRow
                    label="Источник"
                    value={
                      company.sourceUrl ? (
                        <a href={company.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline break-all">
                          {company.sourceUrl}
                        </a>
                      ) : null
                    }
                  />
                </dl>
              </section>

              {company.notes && (
                <section className="bg-white border border-border rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-navy mb-2">Заметки</h2>
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{company.notes}</p>
                </section>
              )}

              {scoreEntries.length > 0 && (
                <section className="bg-white border border-border rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-navy mb-3">Скоринговые баллы</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {scoreEntries.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2 text-xs">
                        <span className="text-muted">{SCORE_LABELS[key] || key}</span>
                        <span className="font-semibold text-navy">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div>
              <section className="bg-white border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-3">Документы</h2>
                <DocumentsPanel
                  companyId={company.id}
                  documents={company.documents || []}
                  onChange={(documents) => setCompany((c) => ({ ...c, documents }))}
                />
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
