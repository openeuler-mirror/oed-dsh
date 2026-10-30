import { test } from "node:test";
import assert from "node:assert/strict";
import { isOperationReadOnly, classifyReadOnly } from "../../src/core/policy.js";

test("safe methods are always read", () => {
  assert.equal(isOperationReadOnly({ method: "GET", operationId: "deleteEverything" }), true);
  assert.equal(isOperationReadOnly({ method: "HEAD", operationId: "x" }), true);
});

test("read keywords allow POST queries", () => {
  assert.equal(
    isOperationReadOnly({ method: "POST", service: "search", operationId: "searchSigByKeyword" }),
    true,
  );
  assert.equal(
    isOperationReadOnly({ method: "POST", service: "forum", operationId: "listPosts" }),
    true,
  );
});

test("write keywords block non-safe methods", () => {
  assert.equal(
    isOperationReadOnly({ method: "POST", service: "forum", operationId: "createTopicPostPM" }),
    false,
  );
  assert.equal(
    isOperationReadOnly({
      method: "POST",
      service: "pkgcontrib",
      operationId: "applyNewSoftwarePackage",
    }),
    false,
  );
  assert.equal(
    isOperationReadOnly({ method: "DELETE", service: "meeting", operationId: "deleteMeeting" }),
    false,
  );
});

test("explicit allowlist overrides keywords", () => {
  assert.equal(
    isOperationReadOnly({
      method: "POST",
      service: "eur",
      operationId: "publishRepo",
      allowlist: ["eur"],
    }),
    true,
  );
  assert.equal(
    isOperationReadOnly({
      method: "POST",
      service: "eur",
      operationId: "publishRepo",
      allowlist: ["eur.publishRepo"],
    }),
    true,
  );
});

test("ambiguous operations fail closed", () => {
  assert.equal(
    isOperationReadOnly({ method: "POST", service: "x", operationId: "doThing" }),
    false,
  );
});

test("classifyReadOnly reports a reason", () => {
  assert.deepEqual(classifyReadOnly({ method: "GET", operationId: "x" }), {
    read: true,
    reason: "safe-method",
  });
  assert.deepEqual(classifyReadOnly({ method: "POST", service: "s", operationId: "searchX" }), {
    read: true,
    reason: "read-keyword",
  });
  assert.deepEqual(classifyReadOnly({ method: "POST", service: "s", operationId: "deleteX" }), {
    read: false,
    reason: "write-keyword",
  });
  assert.deepEqual(classifyReadOnly({ method: "POST", service: "s", operationId: "doThing" }), {
    read: false,
    reason: "ambiguous",
  });
});
