const API_BASE = "/api";

export async function getPapers() {
  const res = await fetch(`${API_BASE}/papers`);
  if (!res.ok) {
    throw new Error(`Failed to fetch papers: ${res.statusText}`);
  }
  return res.json();
}

export async function getPaperById(id) {
  const res = await fetch(`${API_BASE}/papers/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch paper ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function createPaper(paperData) {
  const res = await fetch(`${API_BASE}/papers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paperData),
  });
  if (!res.ok) {
    throw new Error(`Failed to create paper: ${res.statusText}`);
  }
  const result = await res.json();
  return result.data || result;
}

export async function updatePaper(id, updates) {
  const res = await fetch(`${API_BASE}/papers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update paper ${id}: ${res.statusText}`);
  }
  const result = await res.json();
  return result.data || result;
}

export async function deletePaper(id) {
  const res = await fetch(`${API_BASE}/papers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete paper ${id}: ${res.statusText}`);
  }
  return res.json();
}

export async function getCollections() {
  const res = await fetch(`${API_BASE}/collections`);
  if (!res.ok) {
    throw new Error(`Failed to fetch collections: ${res.statusText}`);
  }
  return res.json();
}

export async function createCollection(name) {
  const res = await fetch(`${API_BASE}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create collection: ${res.statusText}`);
  }
  const result = await res.json();
  return result.data || result;
}
