import { requestJson, buildHeaders, normalizeBaseUrl } from "./http.js";
import { OedError } from "./errors.js";
import { describeOperation } from "./operations.js";
import { isOperationReadOnly } from "./policy.js";

function buildRequest(desc, params) {
  let url = desc.url;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null) continue;
    if (url.includes(`{${key}}`)) {
      url = url.replaceAll(`{${key}}`, encodeURIComponent(String(value)));
    } else {
      query.append(key, String(value));
    }
  }
  return { url, queryString: query.toString() };
}

function redactHeaders(headers, token) {
  const out = { ...headers };
  if (token) out.Authorization = "Bearer <redacted>";
  return out;
}

export async function invoke({
  discovery,
  service,
  operation,
  params = {},
  body,
  dryRun = false,
  allowMutations = false,
  readOnlyAllowlist = [],
  allowlist = [],
  token,
  maxResponseChars = 64_000,
  signal,
} = {}) {
  const meta = await discovery.getService(service);

  // Per-user allow-list (fail-open when empty): reject services the oneid
  // account has not authorized.
  if (Array.isArray(allowlist) && allowlist.length > 0 && !allowlist.includes(service)) {
    throw new OedError(`service '${service}' is not in the allow-list`, {
      kind: "service_blocked_by_allowlist",
      hint: "run oed_login again to refresh the allow-list",
    });
  }

  const baseUrl = normalizeBaseUrl(meta.base_url);
  const spec = await discovery.fetchSpec(service);
  const desc = describeOperation(spec, service, operation, { baseUrl });

  const readOnly = isOperationReadOnly({
    method: desc.method,
    service,
    operationId: desc.operationId,
    allowlist: readOnlyAllowlist,
  });
  const write = !readOnly;
  if (write && !allowMutations) {
    throw new OedError(`${desc.method} ${desc.displayName} is a write operation`, {
      kind: "mutation_blocked",
      hint: "this plugin is read-only; enable allowMutations to allow writes",
    });
  }
  if (write && !token) {
    throw new OedError(`${desc.method} ${desc.displayName} requires authentication`, {
      kind: "auth_required",
      hint: "run oed_login first, or set OED_TOKEN",
    });
  }

  const { url, queryString } = buildRequest(desc, params);
  const headers = buildHeaders({ json: body !== undefined, token });

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      service,
      operation: desc.displayName,
      method: desc.method,
      url: queryString ? `${url}?${queryString}` : url,
      headers: redactHeaders(headers, token),
      query: Object.fromEntries(new URLSearchParams(queryString)),
      body,
    };
  }

  const fullUrl = queryString ? `${url}?${queryString}` : url;
  const { status, data } = await requestJson(fullUrl, {
    method: desc.method,
    headers,
    body,
    signal,
    timeoutMs: 60_000,
  });

  const serialized = JSON.stringify(data);
  const response =
    serialized.length > maxResponseChars
      ? { truncated: true, preview: serialized.slice(0, maxResponseChars) }
      : data;

  return {
    ok: true,
    status,
    url: fullUrl,
    method: desc.method,
    service,
    operation: desc.displayName,
    response,
  };
}
