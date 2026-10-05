/** Convert Firestore Timestamps (anything with toDate()) to ISO strings for JSON. */
export function serializeFirestore(value: unknown): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value !== "object") return value;
  const maybeTs = value as { toDate?: () => Date };
  if (typeof maybeTs.toDate === "function") {
    try {
      return maybeTs.toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) return value.map(serializeFirestore);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = serializeFirestore(v);
  }
  return out;
}

export function serializeDoc(id: string, data: Record<string, unknown> | undefined) {
  return { id, ...((serializeFirestore(data ?? {}) as Record<string, unknown>) || {}) };
}
