import { put, list, del } from "@vercel/blob";

const DB_PREFIX = "dexm-crm/db/companies/";
const LEGACY_DB_PATH = "dexm-crm/db/companies.json";

function companyPath(id) {
  return `${DB_PREFIX}${id}.json`;
}

async function fetchBlobJson(url) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function writeCompany(company) {
  await put(companyPath(company.id), JSON.stringify(company, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
  return company;
}

async function migrateLegacyIfNeeded() {
  const { blobs } = await list({ prefix: LEGACY_DB_PATH, limit: 1 });
  const legacy = blobs.find((b) => b.pathname === LEGACY_DB_PATH);
  if (!legacy) return;
  const companies = await fetchBlobJson(legacy.url);
  if (!Array.isArray(companies) || !companies.length) return;
  await Promise.all(companies.filter((c) => c?.id).map((c) => writeCompany(c)));
  await del(legacy.url).catch(() => {});
}

export async function listCompanies() {
  let { blobs } = await list({ prefix: DB_PREFIX });
  if (blobs.length === 0) {
    await migrateLegacyIfNeeded();
    ({ blobs } = await list({ prefix: DB_PREFIX }));
  }
  const companies = await Promise.all(blobs.map((b) => fetchBlobJson(b.url)));
  return companies
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getCompany(id) {
  const path = companyPath(id);
  const { blobs } = await list({ prefix: path, limit: 1 });
  const match = blobs.find((b) => b.pathname === path);
  if (!match) return null;
  return fetchBlobJson(match.url);
}

export async function createCompany(data) {
  const now = new Date().toISOString();
  const company = {
    documents: [],
    ...data,
    id: data.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await writeCompany(company);
  return company;
}

export async function updateCompany(id, patch) {
  const existing = await getCompany(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...patch,
    id,
    documents: existing.documents,
    updatedAt: new Date().toISOString(),
  };
  await writeCompany(updated);
  return updated;
}

export async function deleteCompany(id) {
  const existing = await getCompany(id);
  if (!existing) return false;
  await del(companyPath(id));
  if (existing.documents?.length) {
    await Promise.allSettled(existing.documents.map((d) => del(d.url)));
  }
  return true;
}

export async function addDocument(companyId, doc) {
  const company = await getCompany(companyId);
  if (!company) return null;
  company.documents = company.documents || [];
  company.documents.push(doc);
  company.updatedAt = new Date().toISOString();
  await writeCompany(company);
  return company;
}

export async function removeDocument(companyId, docId) {
  const company = await getCompany(companyId);
  if (!company) return false;
  const docs = company.documents || [];
  const dIdx = docs.findIndex((d) => d.id === docId);
  if (dIdx === -1) return false;
  const [doc] = docs.splice(dIdx, 1);
  company.updatedAt = new Date().toISOString();
  await writeCompany(company);
  await del(doc.url).catch(() => {});
  return true;
}
