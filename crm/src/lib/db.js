import { put, list, del } from "@vercel/blob";

const DB_PATH = "dexm-crm/db/companies.json";

async function loadRaw() {
  const { blobs } = await list({ prefix: DB_PATH, limit: 1 });
  const match = blobs.find((b) => b.pathname === DB_PATH);
  if (!match) return [];
  const res = await fetch(match.url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

async function saveRaw(companies) {
  await put(DB_PATH, JSON.stringify(companies, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function listCompanies() {
  return loadRaw();
}

export async function getCompany(id) {
  const all = await loadRaw();
  return all.find((c) => c.id === id) || null;
}

export async function createCompany(data) {
  const all = await loadRaw();
  const now = new Date().toISOString();
  const company = {
    documents: [],
    ...data,
    id: data.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(company);
  await saveRaw(all);
  return company;
}

export async function updateCompany(id, patch) {
  const all = await loadRaw();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    ...patch,
    id,
    documents: all[idx].documents,
    updatedAt: new Date().toISOString(),
  };
  await saveRaw(all);
  return all[idx];
}

export async function deleteCompany(id) {
  const all = await loadRaw();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  const [company] = all.splice(idx, 1);
  await saveRaw(all);
  if (company.documents?.length) {
    await Promise.allSettled(company.documents.map((d) => del(d.url)));
  }
  return true;
}

export async function addDocument(companyId, doc) {
  const all = await loadRaw();
  const idx = all.findIndex((c) => c.id === companyId);
  if (idx === -1) return null;
  all[idx].documents = all[idx].documents || [];
  all[idx].documents.push(doc);
  all[idx].updatedAt = new Date().toISOString();
  await saveRaw(all);
  return all[idx];
}

export async function removeDocument(companyId, docId) {
  const all = await loadRaw();
  const idx = all.findIndex((c) => c.id === companyId);
  if (idx === -1) return false;
  const docs = all[idx].documents || [];
  const dIdx = docs.findIndex((d) => d.id === docId);
  if (dIdx === -1) return false;
  const [doc] = docs.splice(dIdx, 1);
  all[idx].updatedAt = new Date().toISOString();
  await saveRaw(all);
  await del(doc.url).catch(() => {});
  return true;
}
