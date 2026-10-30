import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeaders, normalizeBaseUrl, requestJson } from "../../src/core/http.js";

test("buildHeaders adds JSON content type and Authorization", () => {
  const h = buildHeaders({ json: true, token: "abc" });
  assert.equal(h["Content-Type"], "application/json");
  assert.equal(h.Authorization, "Bearer abc");
});

test("normalizeBaseUrl strips trailing slash and requires https", () => {
  assert.equal(normalizeBaseUrl("https://apig.osinfra.cn/"), "https://apig.osinfra.cn");
  assert.throws(
    () => normalizeBaseUrl("http://evil.com"),
    (e) => e.kind === "insecure_base_url",
  );
  assert.throws(
    () => normalizeBaseUrl(""),
    (e) => e.kind === "spec_missing",
  );
});

test("requestJson retries transient network errors then succeeds", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls < 3) throw new TypeError("ECONNRESET");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  const { status, data } = await requestJson("https://example.test/x", { retryBaseMs: 1 });
  assert.equal(calls, 3);
  assert.equal(status, 200);
  assert.deepEqual(data, { ok: true });
});

test("requestJson does not retry a WAF block", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response("", { status: 403 });
  };
  await assert.rejects(
    () => requestJson("https://example.test/x", { retryBaseMs: 1 }),
    (e) => e.kind === "waf_block",
  );
  assert.equal(calls, 1);
});

test("requestJson retries a 5xx then succeeds", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1 ? new Response("err", { status: 500 }) : new Response("{}", { status: 200 });
  };
  const { status } = await requestJson("https://example.test/x", { retryBaseMs: 1 });
  assert.equal(status, 200);
  assert.equal(calls, 2);
});
