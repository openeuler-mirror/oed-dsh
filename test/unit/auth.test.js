import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  startDeviceFlow,
  pollDeviceToken,
  parseAllowList,
  authFilePath,
  loadAuth,
  saveAuth,
  clearAuth,
  tokenFingerprint,
} from "../../src/core/auth.js";

test("startDeviceFlow requests a device code with a form-encoded body", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), method: init.method, body: init.body, headers: init.headers };
    return new Response(
      JSON.stringify({
        device_code: "dc",
        user_code: "ABCD",
        verification_uri: "https://omapi.osinfra.cn/oneid/oidc/device",
        interval: 5,
      }),
      { status: 200 },
    );
  };
  const flow = await startDeviceFlow({});
  assert.equal(flow.deviceCode, "dc");
  assert.equal(flow.userCode, "ABCD");
  assert.equal(captured.method, "POST");
  assert.ok(captured.url.includes("/device/code"));
  assert.ok(captured.body.includes("client_id=623c3c2f1eca5ad5fca6c58a"));
  assert.ok(captured.body.includes("scope=openid+profile+offline_access+email+id_token"));
  assert.equal(captured.headers["Content-Type"], "application/x-www-form-urlencoded");
});

test("pollDeviceToken returns the token on success", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ access_token: "at", refresh_token: "rt", id_token: "it", expires_in: 120 }),
      { status: 200 },
    );
  const result = await pollDeviceToken("dc");
  assert.equal(result.ok, true);
  assert.equal(result.accessToken, "at");
  assert.equal(result.refreshToken, "rt");
  assert.equal(result.idToken, "it");
});

test("pollDeviceToken maps authorization_pending to ok:false", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "authorization_pending" }), { status: 400 });
  const result = await pollDeviceToken("dc");
  assert.equal(result.ok, false);
  assert.equal(result.error, "authorization_pending");
});

test("parseAllowList parses a comma-separated string", () => {
  assert.deepEqual(parseAllowList("a,b,c"), ["a", "b", "c"]);
  assert.deepEqual(parseAllowList("  a , b ,"), ["a", "b"]);
  assert.deepEqual(parseAllowList(""), []);
  assert.deepEqual(parseAllowList(null), []);
});

test("authFilePath honors OED_CACHE_DIR and defaults under ~/.cache/oed-dsh", () => {
  assert.equal(authFilePath({ OED_CACHE_DIR: "/tmp/x" }), join("/tmp/x", "auth.json"));
  assert.ok(authFilePath({}).endsWith(join(".cache", "oed-dsh", "auth.json")));
});

test("saveAuth/loadAuth round-trips and loadAuth returns null when missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "oed-auth-"));
  const path = join(dir, "auth.json");
  saveAuth({ access_token: "at", refresh_token: "rt", allowlist: ["a"] }, path);
  const loaded = loadAuth(path);
  assert.equal(loaded.access_token, "at");
  assert.equal(loaded.refresh_token, "rt");
  assert.deepEqual(loaded.allowlist, ["a"]);
  assert.equal(loadAuth(join(dir, "nope.json")), null);
  rmSync(dir, { recursive: true, force: true });
});

test("clearAuth removes auth.json and tokenFingerprint never leaks the token", () => {
  const dir = mkdtempSync(join(tmpdir(), "oed-auth-"));
  const path = join(dir, "auth.json");
  saveAuth({ access_token: "secret-token" }, path);
  clearAuth(path);
  assert.equal(loadAuth(path), null);

  const fp = tokenFingerprint("secret-token");
  assert.equal(fp.length, 12);
  assert.ok(!fp.includes("secret"));
  assert.equal(tokenFingerprint(null), null);
  rmSync(dir, { recursive: true, force: true });
});
