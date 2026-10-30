import { OedError } from "./errors.js";

export const DEFAULT_GATEWAY = "https://api-gateway.osinfra.cn";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const RETRY_BASE_MS = 500;
const RETRY_MAX_MS = 4_000;

/** Browser-style headers the gateway's CloudWAF expects. No default Referer. */
const DEFAULT_HEADERS = {
  "User-Agent": "oed-dsh/0.1.0",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

export function buildHeaders({ json = false, token } = {}) {
  const headers = { ...DEFAULT_HEADERS };
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * The feed's `base_url` is the ONLY source of a service's host. It must be a
 * non-empty https URL; anything else is rejected before any credential is sent.
 */
export function normalizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new OedError("service base_url is empty", {
      kind: "spec_missing",
      hint: "the discovery feed returned no base_url for this service",
    });
  }
  const url = baseUrl.trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new OedError(`service base_url is not a valid URL: ${url}`, {
      kind: "insecure_base_url",
      hint: "refresh the discovery cache and retry",
    });
  }
  if (parsed.protocol !== "https:") {
    throw new OedError(`service base_url is not https: ${url}`, {
      kind: "insecure_base_url",
      hint: "refresh the discovery cache and retry",
    });
  }
  return url;
}

/** Fetch and read the raw body, mapping transport/HTTP failures to OedError. */
async function requestOnce(url, { method, headers, body, signal, timeoutMs }) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const controller = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
      signal: controller,
    });
  } catch (err) {
    if (err?.name === "TimeoutError") {
      throw new OedError(`${method} ${url} timed out`, {
        kind: "network_error",
        retryable: true,
        cause: err,
      });
    }
    if (err?.name === "AbortError") {
      throw new OedError(`${method} ${url} aborted`, {
        kind: "network_error",
        retryable: false,
        cause: err,
      });
    }
    throw new OedError(`${method} ${url} failed: ${err?.message ?? err}`, {
      kind: "network_error",
      retryable: true,
      cause: err,
    });
  }

  const text = await response.text();

  if (response.status === 403 || response.status === 418) {
    throw new OedError(`${method} ${url} was blocked by the gateway (HTTP ${response.status})`, {
      kind: "waf_block",
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new OedError(`upstream returned HTTP ${response.status}`, {
      kind: "upstream_error",
      status: response.status,
      retryable: response.status >= 500 || response.status === 429,
      hint: text.slice(0, 200),
      raw: text,
    });
  }

  return { status: response.status, headers: response.headers, text };
}

function isRetryable(err) {
  return err instanceof OedError && err.retryable === true;
}

function backoffMs(attempt, base = RETRY_BASE_MS) {
  return Math.min(base * 2 ** attempt, RETRY_MAX_MS);
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("aborted"));
      },
      { once: true },
    );
  });
}

/**
 * Run a request with bounded retries on transient failures, then hand the
 * raw result to `pick`. Non-retryable failures are raised immediately.
 */
async function withRetry(url, opts, pick) {
  const { method } = opts;
  let lastError;
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    if (opts.signal?.aborted) {
      throw new OedError(`${method} ${url} aborted`, {
        kind: "network_error",
        cause: opts.signal.reason,
      });
    }
    try {
      const result = await requestOnce(url, opts);
      return pick(result, url, method);
    } catch (err) {
      if (!isRetryable(err) || attempt === opts.retries) throw err;
      lastError = err;
      try {
        await delay(backoffMs(attempt, opts.retryBaseMs), opts.signal);
      } catch (abortErr) {
        throw new OedError(`${method} ${url} aborted`, {
          kind: "network_error",
          cause: abortErr,
        });
      }
    }
  }
  throw lastError;
}

function normalize(opts) {
  return {
    method: "GET",
    timeoutMs: DEFAULT_TIMEOUT_MS,
    retries: DEFAULT_RETRIES,
    retryBaseMs: RETRY_BASE_MS,
    ...opts,
  };
}

/** Fetch and decode JSON, with retries. */
export function requestJson(url, opts = {}) {
  const o = normalize(opts);
  return withRetry(url, o, ({ status, headers, text }, _url, method) => {
    if (!text) return { status, headers, data: null };
    try {
      return { status, headers, data: JSON.parse(text) };
    } catch {
      throw new OedError(`${method} ${url} returned non-JSON`, {
        kind: "upstream_error",
        status,
      });
    }
  });
}

/** Fetch raw text, with retries (for spec files, raw endpoints, etc.). */
export function requestText(url, opts = {}) {
  const o = normalize(opts);
  return withRetry(url, o, ({ status, headers, text }) => ({ status, headers, text }));
}
