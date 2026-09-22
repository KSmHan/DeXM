import { NextResponse } from "next/server";
import { listCompanies, createCompany } from "@/lib/db";

export async function GET() {
  const companies = await listCompanies();
  return NextResponse.json(companies);
}

export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!data.name || !data.name.trim()) {
    return NextResponse.json({ error: "Название компании обязательно" }, { status: 400 });
  }
  const company = await createCompany(data);
  return NextResponse.json(company, { status: 201 });
}
