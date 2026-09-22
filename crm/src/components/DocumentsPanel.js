"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

function humanSize(bytes) {
  if (!bytes) return "";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function iconFor(filename = "") {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    pdf: { label: "PDF", cls: "bg-red-50 text-red-600 border-red-200" },
    doc: { label: "DOC", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    docx: { label: "DOC", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    xls: { label: "XLS", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    xlsx: { label: "XLS", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    csv: { label: "CSV", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    ppt: { label: "PPT", cls: "bg-orange-50 text-orange-600 border-orange-200" },
    pptx: { label: "PPT", cls: "bg-orange-50 text-orange-600 border-orange-200" },
    png: { label: "IMG", cls: "bg-purple-50 text-purple-600 border-purple-200" },
    jpg: { label: "IMG", cls: "bg-purple-50 text-purple-600 border-purple-200" },
    jpeg: { label: "IMG", cls: "bg-purple-50 text-purple-600 border-purple-200" },
  };
  return map[ext] || { label: (ext || "FILE").slice(0, 4).toUpperCase(), cls: "bg-gray-100 text-gray-600 border-gray-200" };
}

export default function DocumentsPanel({ companyId, documents = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function uploadFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        setProgress(`Загрузка «${file.name}»…`);
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: `/api/companies/${companyId}/documents/upload`,
          multipart: file.size > 8 * 1024 * 1024,
        });
        const res = await fetch(`/api/companies/${companyId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: blob.url,
            filename: file.name,
            size: file.size,
            contentType: file.type,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Не удалось сохранить документ");
        }
        const updated = await res.json();
        onChange(updated.documents);
      }
    } catch (e) {
      setError(e.message || "Ошибка загрузки файла");
    } finally {
      setUploading(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeDoc(docId) {
    if (!confirm("Удалить документ?")) return;
    const res = await fetch(`/api/companies/${companyId}/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      onChange(documents.filter((d) => d.id !== docId));
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? "border-gold bg-gold/5" : "border-border bg-white hover:border-navy-light"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(Array.from(e.target.files))}
        />
        <p className="text-sm text-ink font-medium">
          Перетащите файлы сюда или нажмите, чтобы выбрать
        </p>
        <p className="text-xs text-muted mt-1">PDF, Word, Excel, изображения и любые другие форматы</p>
        {uploading && <p className="text-xs text-navy mt-2">{progress || "Загрузка…"}</p>}
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {documents.length === 0 && !uploading && (
          <li className="text-sm text-muted">Документов пока нет.</li>
        )}
        {documents.map((doc) => {
          const icon = iconFor(doc.filename);
          return (
            <li
              key={doc.id}
              className="flex items-center gap-3 bg-white border border-border rounded-lg px-3 py-2.5"
            >
              <span
                className={`shrink-0 text-[10px] font-bold border rounded px-1.5 py-1 ${icon.cls}`}
              >
                {icon.label}
              </span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 truncate text-sm text-navy hover:underline"
                title={doc.filename}
              >
                {doc.filename}
              </a>
              <span className="text-xs text-muted shrink-0">{humanSize(doc.size)}</span>
              <button
                onClick={() => removeDoc(doc.id)}
                className="text-xs text-danger hover:underline shrink-0"
              >
                Удалить
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
