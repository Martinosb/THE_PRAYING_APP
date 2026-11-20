export const tables = [
  "portal_categories",
  "portal_prayer_requests",
  "portal_prayer_logs",
];
export const empty = () => ({
  categories: [],
  requests: [],
  logs: [],
  pending: [],
});
export const groups = ["categories", "requests", "logs"];
export function day(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
export function apply(book, index, row) {
  const key = groups[index];
  const records = book[key];
  const found = records.some((item) => item.id === row.id);
  return {
    ...book,
    [key]: found
      ? records.map((item) => (item.id === row.id ? { ...item, ...row } : item))
      : [...records, row],
    pending: [...book.pending, { index, row }],
  };
}
export async function synchronize(book, client, owner) {
  const categoryIds = new Map();
  for (const operation of book.pending) {
    const { index } = operation;
    const row = { ...operation.row };
    if (categoryIds.has(row.category_id))
      row.category_id = categoryIds.get(row.category_id);
    const table = client.from(tables[index]);
    const result =
      index === 1 && !row.title
        ? await table.update(row).eq("user_id", owner).eq("id", row.id)
        : await table.upsert(
            { ...row, user_id: owner },
            { onConflict: "id", ignoreDuplicates: true },
          );
    if (index === 0 && result.error?.code === "23505") {
      const match = await table
        .select("id,name")
        .eq("user_id", owner)
        .ilike("name", row.name.replace(/[\\%_]/g, "\\$&"));
      if (match.error) throw match.error;
      const found = match.data.find(
        (cat) => cat.name.toLowerCase() === row.name.toLowerCase(),
      );
      if (found) {
        categoryIds.set(row.id, found.id);
        continue;
      }
    }
    if (result.error) throw result.error;
  }
  const next = empty();
  for (const [i, table] of tables.entries()) {
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client
        .from(table)
        .select("*")
        .eq("user_id", owner)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      next[groups[i]].push(...data);
      if (data.length < 500) break;
    }
  }
  return next;
}

// Copy the guest's book only after the signed-in person explicitly chooses it.
// The receipt belongs to this account and keeps repeated imports idempotent.
export function importGuest(book, guest, uuid) {
  const ids = { ...book.imported };
  let next = book;
  for (const [index, group] of groups.entries()) {
    for (const row of guest[group]) {
      if (
        ids[row.id] &&
        (index !== 0 || next.categories.some((c) => c.id === ids[row.id]))
      )
        continue;
      if (index === 0) {
        const existing = next.categories.find(
          (c) => c.name.toLowerCase() === row.name.toLowerCase(),
        );
        if (existing) {
          ids[row.id] = existing.id;
          continue;
        }
      }
      const copy = { ...row, id: uuid() };
      ids[row.id] = copy.id;
      if (index === 1) copy.category_id = ids[row.category_id];
      if (index === 2) copy.request_id = ids[row.request_id];
      next = apply(next, index, copy);
    }
  }
  return { ...next, imported: ids };
}
