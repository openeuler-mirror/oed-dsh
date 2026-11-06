import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createVolatile } from "@deepseek-ai/cosmokit";
import { saveAuth } from "../../src/core/auth.js";
import { buildRuntime } from "../../src/config.js";

test("buildRuntime prefers OED_TOKEN env over stored auth", () => {
  const rt = buildRuntime({}, { OED_TOKEN: "env-token", OED_CACHE_DIR: "/tmp/nonexistent" });
  assert.equal(rt.token, "env-token");
});

test("buildRuntime loads the stored access_token when OED_TOKEN is absent", () => {
  const dir = mkdtempSync(join(tmpdir(), "oed-config-"));
  saveAuth({ access_token: "stored-token" }, join(dir, "auth.json"));
  const rt = buildRuntime({}, { OED_CACHE_DIR: dir });
  assert.equal(rt.token, "stored-token");
  rmSync(dir, { recursive: true, force: true });
});

test("buildRuntime unwraps volatile config fields", () => {
  const rt = buildRuntime({
    atomgitToken: createVolatile("pat"),
    riskAutoApprove: createVolatile("medium"),
    localVerify: createVolatile("docker"),
    allowMutations: createVolatile(true),
  });
  assert.equal(rt.atomgitToken, "pat");
  assert.equal(rt.riskAutoApprove, "medium");
  assert.equal(rt.localVerify, "docker");
  assert.equal(rt.allowMutations, true);
});
