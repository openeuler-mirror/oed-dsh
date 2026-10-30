import { test } from "node:test";
import assert from "node:assert/strict";
import { readFixture } from "../unit/_fixtures.js";

test("discovery fixture has the expected shape", () => {
  const doc = readFixture("discovery.json");
  assert.ok(Array.isArray(doc.communities.openeuler));
  assert.ok(doc.communities.openeuler.length >= 2);
});

test("spec fixtures declare paths with operationIds", () => {
  for (const name of ["cve", "forum"]) {
    const spec = readFixture(`specs/${name}.json`);
    assert.equal(spec.openapi, "3.0.3");
    for (const methods of Object.values(spec.paths)) {
      for (const op of Object.values(methods)) {
        assert.ok(op.operationId, `${name} spec has an operation without operationId`);
      }
    }
  }
});
