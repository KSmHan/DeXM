const STYLES = {
  A: "bg-gold/25 text-navy-deep border-gold/50",
  B: "bg-navy-light/15 text-navy border-navy-light/30",
  C: "bg-gray-200 text-gray-600 border-gray-300",
};

export default function PriorityBadge({ priority }) {
  const key = (priority || "").toUpperCase();
  const cls = STYLES[key] || "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-md border text-xs font-bold ${cls}`}
      title={`Приоритет ${priority || "—"}`}
    >
      {priority || "—"}
    </span>
  );
}
