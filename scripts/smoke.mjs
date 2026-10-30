/**
 * Live smoke test against the openEuler Infra gateway.
 * Not part of CI — requires network access.
 *
 * Usage:
 *   npm run smoke                                  # cve getSecurityNoticeByCveId
 *   npm run smoke -- cve getSecurityNoticeByCveId '{"cveId":"CVE-2019-10082"}'
 */
import { makeDiscovery } from "../src/core/discovery.js";
import { invoke } from "../src/core/invoke.js";

const service = process.argv[2] ?? "cve";
const operation = process.argv[3] ?? "getSecurityNoticeByCveId";
const params = process.argv[4] ? JSON.parse(process.argv[4]) : { cveId: "CVE-2019-10082" };

const gateway = (process.env.OED_GATEWAY || "https://api-gateway.osinfra.cn").replace(/\/+$/, "");
const community = process.env.OED_COMMUNITY || "openeuler";
const discovery = makeDiscovery({ gateway, community });

const services = await discovery.fetchServices();
console.log(`[smoke] discovered ${services.length} services in ${community}`);

const result = await invoke({ discovery, service, operation, params });
const preview = JSON.stringify(result.response).slice(0, 500);
console.log(
  JSON.stringify(
    {
      ok: result.ok,
      status: result.status,
      method: result.method,
      url: result.url,
      responsePreview: preview,
    },
    null,
    2,
  ),
);
