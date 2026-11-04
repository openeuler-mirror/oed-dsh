import { test } from "node:test";
import assert from "node:assert/strict";
import { apply } from "../../index.js";

test("apply registers all tools and skills without schema errors", () => {
  const tools = [];
  const skills = [];
  const ctx = {
    tools: { register: (d) => tools.push(d.name) },
    skills: { register: (s) => skills.push(s) },
  };
  apply(ctx, {
    gateway: "https://api-gateway.osinfra.cn",
    community: "openeuler",
    cacheTtlMs: 600_000,
    maxResponseChars: 64_000,
    allowMutations: false,
    readOnlyAllowlist: [],
  });
  assert.deepEqual(tools, [
    "oed_services",
    "oed_operation_schema",
    "oed_invoke",
    "cve_issue",
    "cve_triage_comment",
    "cve_package_version",
    "cve_post_comment",
    "cve_fix_prepare",
    "cve_open_pr",
    "cve_build",
    "cve_build_wait",
    "cve_repo_get_file",
    "cve_fork_push",
    "cve_pr_get",
    "cve_review_pr",
    "cve_post_review",
    "oed_login",
    "oed_auth_status",
    "oed_auth_logout",
  ]);
  assert.deepEqual(
    skills.map((s) => s.name),
    ["oed-dsh", "cve-triage", "cve-repair", "cve-review"],
  );
  for (const skill of skills) {
    // DSH requires a runtime skill to carry string source + content to load.
    assert.equal(typeof skill.source, "string");
    assert.ok(skill.source.length > 0);
    assert.equal(typeof skill.content, "string");
    assert.ok(skill.content.length > 0);
  }
});
