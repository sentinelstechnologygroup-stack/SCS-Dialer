import { useMemo } from "react";
import { demoEntities } from "@/services/adapters";
import { useWorkspace } from "@/hooks/useWorkspace";

// Bind every legacy request to the session that rendered its controls.
export function useDemoEntities() {
  const context = useWorkspace();
  return useMemo(() => Object.fromEntries(Object.entries(demoEntities).map(([name, entity]) => [name, {
    filter: (query = {}, options = {}) => entity.filter(query, options, context),
    list: () => entity.list(context), count: (query = {}) => entity.count(query, context),
    aggregate: (options) => entity.aggregate(options, context), get: (id) => entity.get(id, context),
    create: (data) => entity.create(data, context), bulkCreate: (records) => entity.bulkCreate(records, context),
    update: (id, patch) => entity.update(id, patch, context), delete: (id) => entity.delete(id, context),
    updateMany: (query, patch) => entity.updateMany(query, patch, context), subscribe: (fn) => entity.subscribe(fn, context),
  }])), [context]);
}