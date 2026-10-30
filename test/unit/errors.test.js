import { test } from "node:test";
import assert from "node:assert/strict";
import { OedError, toToolErrorMessage } from "../../src/core/errors.js";

test("toToolErrorMessage includes kind and hint", () => {
  const err = new OedError("bad service", {
    kind: "service_not_found",
    hint: "list services",
  });
  assert.equal(
    toToolErrorMessage(err),
    "[oed] service_not_found: bad service — hint: list services",
  );
});

test("toToolErrorMessage falls back for plain errors", () => {
  assert.equal(toToolErrorMessage(new Error("boom")), "[oed] boom");
});
