import { ensureSeeded, insertItem, updateItem, removeItem, saveCollection, subscribeCollection } from "@/lib/demoStore";
import { captureWorkspace } from "@/lib/demoWorkspace";
import { demoFailure } from "@/lib/demoErrors";
import { matchesQuery, sortRecords, aggregateRecords } from "@/lib/demoQuery";

// SDK-shaped local facade for retained legacy screens. Never invokes a provider.
export default function localEntity(name, seed = () => []) {
  const read = (context) => ensureSeeded(name, seed, context);
  return {
    filter: async (query = {}, options = {}, context = captureWorkspace()) => {
      const rows = sortRecords(read(context).filter((r) => matchesQuery(r, query)), options.sort);
      const start = Number(options.cursor || 0); const limit = options.limit || 50;
      return { items: rows.slice(start, start + limit), has_more: rows.length > start + limit, next_cursor: rows.length > start + limit ? String(start + limit) : null };
    },
    list: async (context = captureWorkspace()) => ({ items: read(context) }),
    count: async (query = {}, context = captureWorkspace()) => read(context).filter((r) => matchesQuery(r, query)).length,
    aggregate: async (options = {}, context = captureWorkspace()) => aggregateRecords(read(context), options),
    get: async (id, context = captureWorkspace()) => {
      if (!String(id).startsWith(`${context.companyId}:`)) demoFailure("Record belongs to another company. The action was blocked.");
      return read(context).find((r) => r.id === id) || null;
    },
    create: async (data, context = captureWorkspace()) => { read(context); return insertItem(name, { ...data, simulated: true }, context); },
    bulkCreate: async (data, context = captureWorkspace()) => {
      const previous = read(context);
      const rows = data.map((r) => ({ ...r, id: r.id || `${context.companyId}:${crypto.randomUUID()}`, simulated: true }));
      const saved = saveCollection(name, [...previous, ...rows], context);
      return saved.slice(previous.length);
    },
    update: async (id, patch, context = captureWorkspace()) => { read(context); return updateItem(name, id, patch, context); },
    delete: async (id, context = captureWorkspace()) => { read(context); return removeItem(name, id, context); },
    updateMany: async (query, changes, context = captureWorkspace()) => {
      const rows = read(context); let modified = 0;
      const next = rows.map((r) => {
        if (!matchesQuery(r, query)) return r;
        if (changes.$set?.id !== undefined || changes.$set?.companyId !== undefined) demoFailure("Record identity and company ownership are immutable.");
        modified++; return { ...r, ...changes.$set, updated_date: new Date().toISOString() };
      });
      if (modified) saveCollection(name, next, context);
      return { modified, has_more: false };
    },
    subscribe: (fn, context = captureWorkspace()) => subscribeCollection(name, fn, context),
  };
}