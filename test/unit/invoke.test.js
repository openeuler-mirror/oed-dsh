import { test } from "node:test";
import assert from "node:assert/strict";
import { invoke } from "../../src/core/invoke.js";

const cveSpec = {
  openapi: "3.0.3",
  paths: {
    "/cve-security-notice-server/securitynotice/getByCveId": {
      get: {
        operationId: "getSecurityNoticeByCveId",
        parameters: [{ name: "cveId", in: "query", required: true, schema: { type: "string" } }],
      },
    },
  },
};

function fakeDiscovery() {
  return {
    getService: async () => ({ service_name: "cve", base_url: "https://apig.osinfra.cn" }),
    fetchSpec: async () => cveSpec,
  };
}

test("dryRun builds URL + query without network", async () => {
  const result = await invoke({
    discovery: fakeDiscovery(),
    service: "cve",
    operation: "getSecurityNoticeByCveId",
    params: { cveId: "CVE-2019-10082" },
    dryRun: true,
  });
  assert.equal(result.dryRun, true);
  assert.equal(result.method, "GET");
  assert.equal(
    result.url,
    "https://apig.osinfra.cn/cve-security-notice-server/securitynotice/getByCveId?cveId=CVE-2019-10082",
  );
  assert.equal(result.query.cveId, "CVE-2019-10082");
});

test("real call returns the envelope", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 0, result: [] }), { status: 200 });
  const result = await invoke({
    discovery: fakeDiscovery(),
    service: "cve",
    operation: "getSecurityNoticeByCveId",
    params: { cveId: "CVE-2019-10082" },
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.deepEqual(result.response, { code: 0, result: [] });
});

test("write operations are blocked when allowMutations=false", async () => {
  const spec = {
    openapi: "3.0.3",
    paths: {
      "/forum/topics": {
        post: {
          operationId: "createTopicPostPM",
          requestBody: {
            content: {
              "application/json": { schema: { type: "object", properties: {} } },
            },
          },
        },
      },
    },
  };
  const d = {
    getService: async () => ({ service_name: "forum", base_url: "https://apig.osinfra.cn" }),
    fetchSpec: async () => spec,
  };
  await assert.rejects(
    () => invoke({ discovery: d, service: "forum", operation: "createTopicPostPM", body: {} }),
    (err) => err.kind === "mutation_blocked",
  );
});

test("write operations require auth when allowMutations=true", async () => {
  const spec = {
    openapi: "3.0.3",
    paths: {
      "/forum/topics": {
        post: {
          operationId: "createTopicPostPM",
          requestBody: {
            content: {
              "application/json": { schema: { type: "object", properties: {} } },
            },
          },
        },
      },
    },
  };
  const d = {
    getService: async () => ({ service_name: "forum", base_url: "https://apig.osinfra.cn" }),
    fetchSpec: async () => spec,
  };
  await assert.rejects(
    () =>
      invoke({
        discovery: d,
        service: "forum",
        operation: "createTopicPostPM",
        body: {},
        allowMutations: true,
      }),
    (err) => err.kind === "auth_required",
  );
});

test("services outside the allow-list are blocked", async () => {
  const d = {
    getService: async () => ({ service_name: "cve", base_url: "https://apig.osinfra.cn" }),
    fetchSpec: async () => cveSpec,
  };
  await assert.rejects(
    () =>
      invoke({
        discovery: d,
        service: "cve",
        operation: "getSecurityNoticeByCveId",
        allowlist: ["forum", "meeting"],
      }),
    (err) => err.kind === "service_blocked_by_allowlist",
  );
});

test("read-only POST queries are allowed", async () => {
  const spec = {
    openapi: "3.0.3",
    paths: {
      "/sigsearch/docs": {
        post: {
          operationId: "searchSigByKeyword",
          requestBody: {
            content: {
              "application/json": { schema: { type: "object", properties: {} } },
            },
          },
        },
      },
    },
  };
  globalThis.fetch = async () => new Response(JSON.stringify({ code: 0 }), { status: 200 });
  const d = {
    getService: async () => ({ service_name: "search", base_url: "https://apig.osinfra.cn" }),
    fetchSpec: async () => spec,
  };
  const result = await invoke({
    discovery: d,
    service: "search",
    operation: "searchSigByKeyword",
    body: {},
  });
  assert.equal(result.ok, true);
  assert.equal(result.method, "POST");
  assert.deepEqual(result.response, { code: 0 });
});

test("large responses truncate with a totalChars + hint signal", async () => {
  const big = { data: "x".repeat(5000) };
  globalThis.fetch = async () => new Response(JSON.stringify(big), { status: 200 });
  const result = await invoke({
    discovery: fakeDiscovery(),
    service: "cve",
    operation: "getSecurityNoticeByCveId",
    params: { cveId: "CVE-2019-10082" },
    maxResponseChars: 100,
  });
  assert.equal(result.ok, true);
  assert.equal(result.response.truncated, true);
  assert.equal(result.response.totalChars, JSON.stringify(big).length);
  assert.ok(result.response.preview.length <= 100);
  assert.match(result.response.hint, /maxResponseChars/);
});
