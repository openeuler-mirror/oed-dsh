import { requestJson } from "./http.js";
import { OedError } from "./errors.js";

/**
 * Discovery service access with an in-memory TTL cache.
 *
 * The gateway origin is used ONLY for discovery endpoints; a service's runtime
 * host always comes from its feed `base_url` (see normalizeBaseUrl in http.js).
 */
export function makeDiscovery({ gateway, community, cacheTtlMs = 600_000 } = {}) {
  const cache = new Map();

  function cached(key) {
    const entry = cache.get(key);
    return entry && Date.now() - entry.at < cacheTtlMs ? entry.data : undefined;
  }
  function set(key, data) {
    cache.set(key, { data, at: Date.now() });
  }

  async function fetchServices({ refresh = false } = {}) {
    if (!refresh) {
      const hit = cached("services");
      if (hit) return hit;
    }
    const { data } = await requestJson(`${gateway}/discovery/apis`);
    const communities = data?.communities ?? {};
    const list = Array.isArray(communities[community]) ? communities[community] : [];
    set("services", list);
    return list;
  }

  async function getService(serviceName, { refresh = false } = {}) {
    const services = await fetchServices({ refresh });
    const service = services.find((s) => s?.service_name === serviceName);
    if (!service) {
      throw new OedError(`service '${serviceName}' not found`, {
        kind: "service_not_found",
        hint: "call oed_services to list the available service names",
      });
    }
    return service;
  }

  async function fetchSpec(serviceName, { refresh = false } = {}) {
    const service = await getService(serviceName, { refresh });
    const key = `spec:${service.service_name}`;
    if (!refresh) {
      const hit = cached(key);
      if (hit) return hit;
    }
    const { data } = await requestJson(
      `${gateway}/discovery/apis/${community}/${service.service_name}`,
    );
    set(key, data);
    return data;
  }

  return { fetchServices, getService, fetchSpec };
}
