import { NextResponse } from "next/server";
import { getCompany } from "@/lib/db";

export async function GET(req, { params }) {
  const { id, docId } = await params;
  const company = await getCompany(id);
  const doc = company?.documents?.find((d) => d.id === docId);
  if (!doc) return NextResponse.json({ error: "Документ не найден" }, { status: 404 });

  const upstream = await fetch(doc.url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Не удалось получить файл" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": doc.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.filename)}"`,
    },
  });
}
