function tone(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("priority") || s.includes("trigger")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (s.includes("watch")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (s.includes("pass") || s.includes("closed") || s.includes("dead")) {
    return "bg-gray-100 text-gray-500 border-gray-200";
  }
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function StatusPill({ status }) {
  if (!status) return null;
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border truncate max-w-full ${tone(
        status
      )}`}
      title={status}
    >
      {status}
    </span>
  );
}
