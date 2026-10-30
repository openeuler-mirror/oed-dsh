import { invoke as coreInvoke } from "../core/invoke.js";
import { loadAuth } from "../core/auth.js";

export const tool = {
  name: "oed_invoke",
  description:
    "Call one openEuler service operation and return the JSON response. Read-only by default (GET only). Use oed_services then oed_operation_schema to discover the service, operation, and required parameters first; never guess parameter names.",
  parameters: {
    service: { type: "string", required: true, description: "Service short name, e.g. 'cve'." },
    operation: {
      type: "string",
      required: true,
      description: "Operation name, e.g. 'getSecurityNoticeByCveId'.",
    },
    params: {
      type: "object",
      additionalProperties: true,
      description: 'Query/path parameters as an object, e.g. {"cveId":"CVE-2019-10082"}.',
    },
    body: {
      type: "object",
      additionalProperties: true,
      description: "JSON request body (POST/PUT/PATCH only).",
    },
    dryRun: {
      type: "boolean",
      description: "Preview the request (method/url/headers/query/body) without sending it.",
    },
  },
};

export async function run(runtime, args, signal) {
  // Re-read auth.json so a login during the session is picked up immediately
  // (runtime.token is cached at activation). OED_TOKEN env still wins.
  const token = process.env.OED_TOKEN || loadAuth()?.access_token || runtime.token || undefined;
  return coreInvoke({
    discovery: runtime.discovery,
    service: args.service,
    operation: args.operation,
    params: args.params ?? {},
    body: args.body,
    dryRun: Boolean(args.dryRun),
    allowMutations: runtime.allowMutations,
    readOnlyAllowlist: runtime.readOnlyAllowlist,
    allowlist: runtime.allowlist,
    token,
    maxResponseChars: runtime.maxResponseChars,
    signal,
  });
}
