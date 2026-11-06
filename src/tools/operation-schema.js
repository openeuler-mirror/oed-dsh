import { describeOperation, sanitizeJson } from "../core/operations.js";
import { normalizeBaseUrl } from "../core/http.js";

export const tool = {
  name: "oed_operation_schema",
  description:
    "Inspect one openEuler service operation: HTTP method/path/url, query/path parameters with their flags, request body schema, and a usage string. Use this before calling oed_invoke so you pass the right arguments. 探查一个 openEuler 服务操作：HTTP 方法/路径/url、参数表、body schema 与 usage；调用 oed_invoke 前先用它确认参数。",
  parameters: {
    service: {
      type: "string",
      required: true,
      description: "Service short name, e.g. 'cve' (from oed_services).",
    },
    operation: {
      type: "string",
      required: true,
      description: "Operation name, e.g. 'getSecurityNoticeByCveId'.",
    },
    refresh: { type: "boolean", description: "Force a fresh spec fetch." },
  },
};

export async function run(runtime, args) {
  const meta = await runtime.discovery.getService(args.service, {
    refresh: Boolean(args?.refresh),
  });
  const spec = await runtime.discovery.fetchSpec(args.service, {
    refresh: Boolean(args?.refresh),
  });
  const desc = describeOperation(spec, args.service, args.operation, {
    baseUrl: normalizeBaseUrl(meta.base_url),
  });
  return sanitizeJson({
    ok: true,
    service: args.service,
    operation: desc.displayName,
    operationId: desc.operationId,
    method: desc.method,
    path: desc.path,
    url: desc.url,
    summary: desc.summary,
    description: desc.description,
    parameters: desc.parameters,
    body: desc.body,
    usage: desc.usage,
  });
}
