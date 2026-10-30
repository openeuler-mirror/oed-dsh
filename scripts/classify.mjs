/**
 * Classify every operation on the live gateway with the read-only policy and
 * write a Markdown report to docs/readonly-report.md.
 *
 * This is a maintenance script: it needs network access and is not part of CI.
 * Review the "ambiguous" blocked rows (no read/write keyword) before adding
 * them to the default read-only allowlist.
 */
import { writeFileSync } from "node:fs";
import { makeDiscovery } from "../src/core/discovery.js";
import { collectOperations } from "../src/core/operations.js";
import { normalizeBaseUrl } from "../src/core/http.js";
import { classifyReadOnly } from "../src/core/policy.js";

const gateway = (process.env.OED_GATEWAY || "https://api-gateway.osinfra.cn").replace(/\/+$/, "");
const community = process.env.OED_COMMUNITY || "openeuler";
const d = makeDiscovery({ gateway, community });

const services = await d.fetchServices();
const lines = [];
let total = 0;
let read = 0;
let blocked = 0;
const ambiguous = [];

lines.push("# Read-only policy report");
lines.push("");
lines.push(`- gateway: ${gateway}`);
lines.push(`- community: ${community}`);
lines.push(`- generated: ${new Date().toISOString()}`);
lines.push("");

for (const s of services) {
  let spec;
  try {
    spec = await d.fetchSpec(s.service_name);
  } catch (e) {
    lines.push(`## ${s.service_name} — ERROR ${e.kind ?? e.message}`);
    lines.push("");
    continue;
  }
  const base = normalizeBaseUrl(s.base_url);
  const ops = collectOperations(spec, { baseUrl: base });
  lines.push(`## ${s.service_name} (${ops.length})`);
  lines.push("");
  lines.push("| operation | method | read | reason | summary |");
  lines.push("|---|---|---|---|---|");
  for (const o of ops) {
    const c = classifyReadOnly({
      method: o.method,
      service: s.service_name,
      operationId: o.operationId,
    });
    const summary = (o.summary || "").replaceAll("|", "\\|").slice(0, 80);
    lines.push(
      `| \`${o.displayName}\` | ${o.method} | ${c.read ? "✅" : "⛔"} | ${c.reason} | ${summary} |`,
    );
    total += 1;
    if (c.read) read += 1;
    else {
      blocked += 1;
      if (c.reason === "ambiguous") {
        ambiguous.push(`${s.service_name}.${o.displayName}  (${o.method})  ${o.summary ?? ""}`);
      }
    }
  }
  lines.push("");
}

lines.push("## Totals");
lines.push("");
lines.push(`- operations: ${total}`);
lines.push(`- read: ${read}`);
lines.push(`- blocked: ${blocked}`);
lines.push("");

writeFileSync(new URL("../docs/readonly-report.md", import.meta.url), lines.join("\n"));

console.log(`wrote docs/readonly-report.md (${total} ops, ${read} read, ${blocked} blocked)`);
console.log("\n=== AMBIGUOUS BLOCKED (review candidates) ===");
console.log(ambiguous.join("\n") || "(none)");
