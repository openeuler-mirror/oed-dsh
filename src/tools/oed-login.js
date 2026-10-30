import { startDeviceFlow, pollDeviceToken, fetchAllowList, saveAuth } from "../core/auth.js";

const POLL_WINDOW_MS = 120_000;
const POLL_INTERVAL_MS = 5_000;

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("aborted"));
      },
      { once: true },
    );
  });
}

export const tool = {
  name: "oed_login",
  description:
    "openEuler oneid 登录（RFC 8628 device flow）。不带 deviceCode 时发起登录并返回一个可直接点击的授权链接；带上 deviceCode 时自动轮询直至完成登录（存 auth.json + allow-list）。",
  parameters: {
    deviceCode: {
      type: "string",
      description: "轮询阶段的 device code（由上一次不带 deviceCode 的调用返回）",
    },
  },
};

export async function run(runtime, args, signal) {
  const env = process.env ?? {};
  const clientId = runtime.clientId;

  if (!args?.deviceCode) {
    const flow = await startDeviceFlow({ signal, env, clientId });
    // verification_uri_complete already carries the user code, so the user just
    // clicks one link; fall back to verification_uri + user code otherwise.
    const link = flow.verificationUriComplete || flow.verificationUri;
    const codeHint = flow.verificationUriComplete ? "" : `（用户码 ${flow.userCode}）`;
    return {
      ok: true,
      phase: "pending",
      verificationUri: flow.verificationUri,
      verificationUriComplete: flow.verificationUriComplete,
      userCode: flow.userCode,
      deviceCode: flow.deviceCode,
      interval: flow.interval,
      expiresIn: flow.expiresIn,
      instruction: `请打开 ${link}${codeHint} 并授权；授权后调用 oed_login 并传入 deviceCode 完成登录。`,
    };
  }

  // Poll until the user authorizes, or the window closes.
  const deadline = Date.now() + POLL_WINDOW_MS;
  let poll;
  for (;;) {
    poll = await pollDeviceToken(args.deviceCode, { signal, env, clientId });
    if (poll.ok) break;
    if (poll.error !== "authorization_pending" && poll.error !== "slow_down") {
      return { ok: false, phase: "failed", error: poll.error, deviceCode: args.deviceCode };
    }
    if (Date.now() >= deadline) {
      return { ok: true, phase: "pending", status: poll.error, deviceCode: args.deviceCode };
    }
    await delay(poll.error === "slow_down" ? 10_000 : POLL_INTERVAL_MS, signal);
  }

  let allowlist = [];
  try {
    allowlist = await fetchAllowList(poll.accessToken, { signal, env });
  } catch {
    /* allow-list is best-effort; login still succeeds */
  }

  saveAuth({
    access_token: poll.accessToken,
    refresh_token: poll.refreshToken,
    id_token: poll.idToken,
    expires_in: poll.expiresIn,
    allowlist,
    login_at: new Date().toISOString(),
  });

  return { ok: true, phase: "done", allowlist, expiresIn: poll.expiresIn };
}
