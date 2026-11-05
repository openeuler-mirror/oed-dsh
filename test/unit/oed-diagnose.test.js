import { test } from "node:test";
import assert from "node:assert/strict";
import { tool, run } from "../../src/tools/oed-diagnose.js";

test("oed_diagnose reports local state without a token (no network)", async () => {
  const runtime = {
    atomgitToken: undefined, // 无 token → 不发网络请求
    riskAutoApprove: "never",
    localVerify: "lightweight",
    allowMutations: true,
  };
  const result = await run(runtime, {}, undefined);
  assert.equal(result.ok, true);
  assert.equal(typeof result.pluginVersion, "string");
  assert.equal(result.atomgitTokenConfigured, false);
  assert.equal(result.atomgitTokenValid, null);
  assert.equal(result.atomgitTokenUser, null);
  assert.deepEqual(result.config, {
    riskAutoApprove: "never",
    localVerify: "lightweight",
    allowMutations: true,
  });
});

test("oed_diagnose tool exposes the token-validity fields in its contract", () => {
  assert.equal(tool.name, "oed_diagnose");
  assert.match(tool.description, /有效性/);
});
