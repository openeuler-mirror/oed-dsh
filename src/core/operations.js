import { OedError } from "./errors.js";

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

/** camelCase → kebab-case, keeping existing hyphens/underscores intact. */
export function toFlag(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** APIG prefixes operationIds with `API_`; strip it for the display name. */
export function stripApiPrefix(operationId) {
  return String(operationId).replace(/^API_/, "");
}

/**
 * Deep-copy into a JSON-safe value so a tool output survives a lossless
 * JSON round-trip: undefined → null (objects drop the key), NaN/±Infinity → null.
 */
export function sanitizeJson(value) {
  if (value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    // Normalize negative zero so the value survives a lossless JSON round trip.
    return value === 0 && 1 / value === -Infinity ? 0 : value;
  }
  // Functions, symbols and bigints are not JSON-serializable; drop them like undefined.
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    return null;
  }
  if (Array.isArray(value)) return value.map(sanitizeJson);
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = sanitizeJson(v);
    }
    return out;
  }
  return value;
}

export function collectOperations(spec, { baseUrl } = {}) {
  const operations = [];
  for (const [path, methods] of Object.entries(spec?.paths ?? {})) {
    for (const [method, op] of Object.entries(methods ?? {})) {
      if (!HTTP_METHODS.has(method)) continue;
      if (!op || typeof op.operationId !== "string") continue;
      operations.push({
        path,
        method: method.toUpperCase(),
        operationId: op.operationId,
        displayName: stripApiPrefix(op.operationId),
        summary: op.summary ?? "",
        description: op.description ?? "",
        url: `${baseUrl}${path}`,
      });
    }
  }
  return operations;
}

function findOperation(spec, serviceName, operation, baseUrl) {
  const operations = collectOperations(spec, { baseUrl });
  const target = operations.find((o) => o.displayName === operation || o.operationId === operation);
  if (!target) {
    throw new OedError(`service '${serviceName}' has no operation '${operation}'`, {
      kind: "method_not_found",
      hint: `available operations: ${operations
        .map((o) => o.displayName)
        .slice(0, 30)
        .join(", ")}`,
    });
  }
  return target;
}

function describeParameters(op) {
  return (op?.parameters ?? [])
    .filter((p) => p?.in === "query" || p?.in === "path")
    .map((p) => ({
      name: p.name,
      in: p.in,
      required: Boolean(p.required),
      flag: `--${toFlag(p.name)}`,
      altFlag: toFlag(p.name) === p.name ? null : `--${p.name}`,
      type: p.schema?.type ?? "string",
      description: p.description ?? "",
    }));
}

function describeBody(op) {
  const schema = op?.requestBody?.content?.["application/json"]?.schema;
  if (!schema) return null;
  return { schema, requiredFields: Array.isArray(schema.required) ? schema.required : [] };
}

export function describeOperation(spec, serviceName, operation, { baseUrl } = {}) {
  const target = findOperation(spec, serviceName, operation, baseUrl);
  const op = spec.paths[target.path][target.method.toLowerCase()];
  const parameters = describeParameters(op);
  const body = describeBody(op);
  const usage = [
    `oed ${serviceName} ${target.displayName}`,
    ...parameters.filter((p) => p.in === "query").map((p) => `--${toFlag(p.name)} <value>`),
    body ? "--json '{...}'" : "",
  ].join(" ");
  return { ...target, parameters, body, usage };
}
