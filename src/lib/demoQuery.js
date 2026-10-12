export function matchesQuery(record, query = {}) {
  return Object.entries(query).every(([field, expected]) => {
    if (field === "$or") return expected.some((q) => matchesQuery(record, q));
    if (field === "$and") return expected.every((q) => matchesQuery(record, q));
    const value = record[field];
    if (!expected || typeof expected !== "object" || Array.isArray(expected)) return value === expected;
    return Object.entries(expected).every(([op, operand]) => {
      if (op === "$in") return operand.includes(value);
      if (op === "$nin") return !operand.includes(value);
      if (op === "$ne") return value !== operand;
      if (op === "$exists") return (value !== undefined) === operand;
      if (op === "$gt") return value > operand;
      if (op === "$gte") return value >= operand;
      if (op === "$lt") return value < operand;
      if (op === "$lte") return value <= operand;
      if (op === "$regex") return new RegExp(operand, expected.$options || "").test(String(value || ""));
      return op === "$options";
    });
  });
}
export function sortRecords(items, sort = "-created_date") {
  const descending = sort.startsWith("-"); const key = sort.replace(/^-/, "");
  return items.slice().sort((a, b) => {
    const left = a[key] ?? ""; const right = b[key] ?? "";
    return (left < right ? -1 : left > right ? 1 : 0) * (descending ? -1 : 1);
  });
}
export function aggregateRecords(items, options) {
  const groups = new Map();
  for (const item of items.filter((r) => matchesQuery(r, options.query))) {
    const value = options.dateBucket ? String(item[options.dateBucket.field] || "").slice(0, 10) : item[options.groupBy] || "unknown";
    const row = groups.get(value) || { [options.dateBucket ? "_id" : options.groupBy || "group"]: value, count: 0 };
    row.count++; groups.set(value, row);
  }
  return { rows: sortRecords([...groups.values()], options.sort || "group").slice(0, options.limit || 1000), truncated: false };
}