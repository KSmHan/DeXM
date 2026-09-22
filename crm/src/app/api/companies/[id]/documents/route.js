import { NextResponse } from "next/server";
import { addDocument, getCompany } from "@/lib/db";

export async function POST(req, { params }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const { url, filename, size, contentType } = data || {};
  if (!url || !filename) {
    return NextResponse.json({ error: "Отсутствуют данные файла" }, { status: 400 });
  }

  const doc = {
    id: crypto.randomUUID(),
    filename,
    url,
    size: size || 0,
    contentType: contentType || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };
  const updated = await addDocument(id, doc);
  if (!updated) return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  return NextResponse.json(updated, { status: 201 });
}
