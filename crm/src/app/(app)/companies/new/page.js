"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import CompanyForm from "@/components/CompanyForm";

export default function NewCompanyPage() {
  const router = useRouter();

  async function handleSubmit(data) {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Не удалось создать компанию");
    router.push(`/companies/${result.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-muted hover:text-navy">
        ← Назад к списку
      </Link>
      <h1 className="text-xl font-semibold text-ink mt-2 mb-6">Новая компания</h1>
      <div className="bg-white border border-border rounded-xl p-6">
        <CompanyForm onSubmit={handleSubmit} submitLabel="Создать компанию" />
      </div>
    </div>
  );
}
