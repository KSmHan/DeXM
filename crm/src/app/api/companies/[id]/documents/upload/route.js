import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getCompany } from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const company = await getCompany(id);
        if (!company) {
          throw new Error("Компания не найдена");
        }
        return {
          addRandomSuffix: true,
          allowedContentTypes: undefined,
          maximumSizeInBytes: 200 * 1024 * 1024,
          tokenPayload: JSON.stringify({ companyId: id }),
        };
      },
      onUploadCompleted: async () => {
        // Метаданные документа сохраняются отдельным запросом с клиента
        // сразу после завершения загрузки — см. POST /api/companies/[id]/documents
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
