/**
 * CI build polling state machine: call a status query until it reaches a
 * terminal state (success / failure) or a timeout. Pure logic, no DSH imports.
 */

const SUCCESS_VALUES = new Set([
  "success",
  "succeeded",
  "done",
  "completed",
  "finished",
  "pass",
  "passed",
  "ok",
]);
const FAILURE_VALUES = new Set([
  "failed",
  "failure",
  "fail",
  "error",
  "aborted",
  "cancelled",
  "canceled",
]);

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

/** Read the status value, trying the response body, then data/result envelopes. */
function readStatus(data, field) {
  if (data == null) return undefined;
  if (typeof data !== "object") return data;
  for (const candidate of [data, data?.data, data?.result]) {
    if (candidate && typeof candidate === "object" && candidate[field] !== undefined) {
      return candidate[field];
    }
  }
  return undefined;
}

/** Classify a raw status value into success / failure / running. */
export function classifyStatus(status) {
  if (status === undefined || status === null || status === "") return "running";
  const s = String(status).toLowerCase();
  if (SUCCESS_VALUES.has(s)) return "success";
  if (FAILURE_VALUES.has(s)) return "failure";
  return "running";
}

/**
 * Poll `invoke({service, operation, params, signal})` until the status field
 * reaches a terminal value or the timeout elapses. `invoke` returns an
 * envelope with a `response` field (the parsed body).
 */
export async function pollToTerminal({
  invoke,
  service,
  operation,
  params = {},
  field = "status",
  intervalMs = 30_000,
  timeoutMs = 30 * 60_000,
  signal,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let last;
  for (;;) {
    last = await invoke({ service, operation, params, signal });
    const status = readStatus(last?.response ?? last, field);
    const state = classifyStatus(status);
    if (state !== "running") {
      return { ok: true, terminal: true, state, status, result: last };
    }
    if (Date.now() >= deadline) {
      return { ok: false, terminal: false, state: "timeout", status, result: last };
    }
    await delay(intervalMs, signal);
  }
}
