import { NextResponse } from "next/server";
import { getCompany, updateCompany, deleteCompany } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PUT(req, { params }) {
  const { id } = await params;
  let patch;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const company = await updateCompany(id, patch);
  if (!company) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(company);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const ok = await deleteCompany(id);
  if (!ok) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
