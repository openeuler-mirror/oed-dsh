export const tool = {
  name: "oed_services",
  description:
    "List openEuler community services exposed by the Infra gateway. Call this first to discover what is available, then inspect one service with oed_operation_schema and call it with oed_invoke.",
  parameters: {
    refresh: {
      type: "boolean",
      description: "Force a fresh discovery fetch instead of using the cache.",
    },
  },
};

export async function run(runtime, args) {
  const services = await runtime.discovery.fetchServices({ refresh: Boolean(args?.refresh) });
  return {
    ok: true,
    community: runtime.community,
    total: services.length,
    services: services.map((s) => ({
      service_name: s.service_name,
      title: s.title,
      version: s.version,
      description: s.description,
    })),
  };
}
