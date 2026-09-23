import { NextResponse } from "next/server";
import { listCompanies, createCompany, findCompanyByName } from "@/lib/db";

export async function GET() {
  try {
    const companies = await listCompanies();
    return NextResponse.json(companies);
  } catch (err) {
    return NextResponse.json({ error: `Ошибка чтения из хранилища: ${err.message}` }, { status: 500 });
  }
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
  try {
    const existing = await findCompanyByName(data.name);
    if (existing) {
      return NextResponse.json(
        {
          error: `Компания «${existing.name}» уже есть в базе`,
          duplicate: true,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }
    const company = await createCompany(data);
    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: `Ошибка записи в хранилище: ${err.message}` }, { status: 500 });
  }
}
