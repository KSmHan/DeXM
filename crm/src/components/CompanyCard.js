import Link from "next/link";
import PriorityBadge from "./PriorityBadge";
import StatusPill from "./StatusPill";

export default function CompanyCard({ company }) {
  const docCount = company.documents?.length || 0;
  const location = [company.city, company.state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/companies/${company.id}`}
      className="group block bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gold/50 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink truncate group-hover:text-navy">
            {company.name}
          </h3>
          {location && <p className="text-xs text-muted mt-0.5">{location}</p>}
        </div>
        <PriorityBadge priority={company.priority} />
      </div>

      {company.sector && (
        <p className="mt-2 text-xs inline-block bg-cream border border-border rounded px-2 py-0.5 text-navy">
          {company.sector}
        </p>
      )}

      {company.rationale && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{company.rationale}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <StatusPill status={company.status} />
        <div className="flex items-center gap-3 shrink-0 text-xs text-muted">
          {typeof company.score === "number" && (
            <span className="flex items-center gap-1" title="Балл приоритета">
              <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6z" />
              </svg>
              {company.score}
            </span>
          )}
          <span className="flex items-center gap-1" title="Документы">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" strokeLinejoin="round" />
              <path d="M14 3v5h5" strokeLinejoin="round" />
            </svg>
            {docCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
