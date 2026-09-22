import { NextResponse } from "next/server";
import { removeDocument } from "@/lib/db";

export async function DELETE(req, { params }) {
  const { id, docId } = await params;
  const ok = await removeDocument(id, docId);
  if (!ok) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
