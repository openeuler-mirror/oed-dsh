/**
 * Read-only policy: classify an operation as read or write.
 *
 * The openEuler gateway uses POST/PUT for many pure queries (search, counts,
 * lookups), so "read-only" cannot mean "GET only". We use a fail-closed
 * heuristic on the operationId plus an explicit allowlist override:
 *
 *   - GET / HEAD / OPTIONS            -> read
 *   - service or service.operation    -> read (explicit allowlist)
 *   - operationId matches a read word and no write word -> read
 *   - anything else                   -> write (blocked when allowMutations=false)
 */

const READ_WORDS = [
  "list",
  "get",
  "query",
  "search",
  "find",
  "count",
  "retrieve",
  "read",
  "describe",
  "lookup",
  "check",
  "exists",
  "history",
  "log",
  "latest",
  "top",
  "detail",
  "stat",
  "summary",
  "info",
  "preview",
  "view",
];

const WRITE_WORDS = [
  "create",
  "update",
  "delete",
  "remove",
  "apply",
  "submit",
  "cancel",
  "publish",
  "approve",
  "reject",
  "edit",
  "save",
  "upload",
  "build",
  "retry",
  "sign",
  "confirm",
  "revoke",
  "close",
  "merge",
  "trigger",
  "reply",
  "follow",
  "bookmark",
  "mark",
  "reset",
  "move",
  "copy",
  "transfer",
  "notify",
  "dismiss",
  "resolve",
  "release",
  "archive",
  "restore",
  "fork",
  "clone",
  "lock",
  "unlock",
  "pin",
  "unpin",
];

export function classifyReadOnly({ method, service, operationId, allowlist = [] } = {}) {
  const verb = String(method ?? "").toUpperCase();
  if (verb === "GET" || verb === "HEAD" || verb === "OPTIONS") {
    return { read: true, reason: "safe-method" };
  }

  if (allowlist.includes(service) || allowlist.includes(`${service}.${operationId}`)) {
    return { read: true, reason: "allowlist" };
  }

  const op = String(operationId ?? "").toLowerCase();
  const hasRead = READ_WORDS.some((w) => op.includes(w));
  const hasWrite = WRITE_WORDS.some((w) => op.includes(w));
  if (hasRead && !hasWrite) return { read: true, reason: "read-keyword" };
  if (hasWrite) return { read: false, reason: "write-keyword" };
  return { read: false, reason: "ambiguous" };
}

export function isOperationReadOnly(options) {
  return classifyReadOnly(options).read;
}
