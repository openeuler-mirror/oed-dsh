import { test } from "node:test";
import assert from "node:assert/strict";
import { makeDiscovery } from "../../src/core/discovery.js";

const discoveryDoc = {
  communities: {
    openeuler: [
      { service_name: "cve", base_url: "https://apig.osinfra.cn" },
      { service_name: "forum", base_url: "https://apig.osinfra.cn" },
    ],
  },
};

function stubFetch(routes) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    for (const [pattern, payload] of routes) {
      if (String(url).includes(pattern)) {
        return new Response(JSON.stringify(payload), { status: 200 });
      }
    }
    return new Response("{}", { status: 404 });
  };
  return calls;
}

test("fetchServices flattens the current community", async () => {
  stubFetch([["/discovery/apis", discoveryDoc]]);
  const d = makeDiscovery({
    gateway: "https://api-gateway.osinfra.cn",
    community: "openeuler",
    cacheTtlMs: 600_000,
  });
  const services = await d.fetchServices();
  assert.equal(services.length, 2);
  assert.equal(services[0].service_name, "cve");
});

test("fetchServices caches within TTL", async () => {
  const calls = stubFetch([["/discovery/apis", discoveryDoc]]);
  const d = makeDiscovery({
    gateway: "https://api-gateway.osinfra.cn",
    community: "openeuler",
    cacheTtlMs: 600_000,
  });
  await d.fetchServices();
  await d.fetchServices();
  assert.equal(calls.length, 1);
});

test("getService throws service_not_found", async () => {
  stubFetch([["/discovery/apis", discoveryDoc]]);
  const d = makeDiscovery({
    gateway: "https://api-gateway.osinfra.cn",
    community: "openeuler",
  });
  await assert.rejects(
    () => d.getService("nope"),
    (err) => err.kind === "service_not_found",
  );
});
