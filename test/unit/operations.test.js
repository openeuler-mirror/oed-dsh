import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toFlag,
  stripApiPrefix,
  collectOperations,
  describeOperation,
  sanitizeJson,
} from "../../src/core/operations.js";
import { readFixture } from "./_fixtures.js";

test("toFlag kebab-cases camelCase and acronym runs", () => {
  assert.equal(toFlag("cveId"), "cve-id");
  assert.equal(toFlag("pageNum"), "page-num");
  assert.equal(toFlag("countPerPage"), "count-per-page");
  assert.equal(toFlag("id"), "id");
});

test("stripApiPrefix removes API_ and leaves others unchanged", () => {
  assert.equal(stripApiPrefix("API_createTopicPostPM"), "createTopicPostPM");
  assert.equal(stripApiPrefix("getSecurityNoticeByCveId"), "getSecurityNoticeByCveId");
});

test("collectOperations lists operations and strips API_ for display", () => {
  const spec = readFixture("specs/cve.json");
  const ops = collectOperations(spec, {
    serviceName: "cve",
    baseUrl: "https://apig.osinfra.cn",
  });
  assert.equal(ops.length, 1);
  assert.equal(ops[0].displayName, "getSecurityNoticeByCveId");
  assert.equal(ops[0].method, "GET");
});

test("describeOperation derives flags, body schema, and usage", () => {
  const cve = readFixture("specs/cve.json");
  const desc = describeOperation(cve, "cve", "getSecurityNoticeByCveId", {
    baseUrl: "https://apig.osinfra.cn",
  });
  assert.equal(desc.method, "GET");
  assert.equal(desc.parameters[0].flag, "--cve-id");
  assert.equal(desc.parameters[0].required, true);
  assert.match(desc.usage, /--cve-id/);

  const forum = readFixture("specs/forum.json");
  const fdesc = describeOperation(forum, "forum", "createTopicPostPM", {
    baseUrl: "https://apig.osinfra.cn",
  });
  assert.equal(fdesc.displayName, "createTopicPostPM");
  assert.equal(fdesc.method, "POST");
  assert.deepEqual(fdesc.body.requiredFields, ["title", "raw"]);
});

test("describeOperation throws method_not_found", () => {
  const cve = readFixture("specs/cve.json");
  assert.throws(
    () => describeOperation(cve, "cve", "nope", { baseUrl: "https://apig.osinfra.cn" }),
    (err) => err.kind === "method_not_found",
  );
});

test("sanitizeJson strips undefined and non-finite numbers losslessly", () => {
  const input = {
    a: 1,
    b: undefined,
    c: [1, undefined, NaN, Infinity, -Infinity],
    d: { e: undefined, f: "ok" },
  };
  const out = sanitizeJson(input);
  assert.deepEqual(out, {
    a: 1,
    c: [1, null, null, null, null],
    d: { f: "ok" },
  });
  // survives a lossless JSON round-trip
  assert.deepEqual(JSON.parse(JSON.stringify(out)), out);
});
