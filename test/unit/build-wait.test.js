import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyStatus, pollToTerminal } from "../../src/core/build-wait.js";

test("classifyStatus maps terminal values", () => {
  assert.equal(classifyStatus("success"), "success");
  assert.equal(classifyStatus("SUCCEEDED"), "success");
  assert.equal(classifyStatus("done"), "success");
  assert.equal(classifyStatus("failed"), "failure");
  assert.equal(classifyStatus("error"), "failure");
  assert.equal(classifyStatus("aborted"), "failure");
  assert.equal(classifyStatus("running"), "running");
  assert.equal(classifyStatus("building"), "running");
  assert.equal(classifyStatus(undefined), "running");
  assert.equal(classifyStatus(""), "running");
});

test("pollToTerminal returns success on a terminal success status", async () => {
  const invoke = async () => ({ response: { status: "success" } });
  const result = await pollToTerminal({
    invoke,
    service: "eulermaker",
    operation: "getBuildStatus",
    field: "status",
  });
  assert.equal(result.terminal, true);
  assert.equal(result.state, "success");
});

test("pollToTerminal polls until a terminal state", async () => {
  const calls = [];
  const invoke = async () => {
    calls.push(1);
    return { response: { status: calls.length >= 2 ? "failed" : "running" } };
  };
  const result = await pollToTerminal({
    invoke,
    service: "eulermaker",
    operation: "getBuildStatus",
    field: "status",
    intervalMs: 1,
  });
  assert.equal(result.state, "failure");
  assert.equal(calls.length, 2);
});

test("pollToTerminal reads the status from a nested data envelope", async () => {
  const invoke = async () => ({ response: { code: 0, data: { status: "completed" } } });
  const result = await pollToTerminal({
    invoke,
    service: "eulermaker",
    operation: "getBuildStatus",
    field: "status",
  });
  assert.equal(result.state, "success");
});

test("pollToTerminal times out when the status never reaches a terminal state", async () => {
  const invoke = async () => ({ response: { status: "running" } });
  const result = await pollToTerminal({
    invoke,
    service: "eulermaker",
    operation: "getBuildStatus",
    field: "status",
    intervalMs: 1,
    timeoutMs: 5,
  });
  assert.equal(result.terminal, false);
  assert.equal(result.state, "timeout");
});
