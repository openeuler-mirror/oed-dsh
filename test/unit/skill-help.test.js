import { test } from "node:test";
import assert from "node:assert/strict";
import { skill } from "../../src/skill-help.js";

test("oed-help skill has a valid name and routing description", () => {
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(typeof skill.source, "string");
  for (const kw of ["安装", "配置", "排错", "bug"]) {
    assert.ok(skill.description.includes(kw), `description missing keyword: ${kw}`);
  }
});

test("oed-help skill body names config and troubleshooting", () => {
  assert.ok(skill.content.length < 8000, "skill body must stay under the 8k prune threshold");
  for (const kw of ["安装", "配置", "atomgit_token_missing", "oed_diagnose", "oed_report_issue"]) {
    assert.ok(skill.content.includes(kw), `body missing keyword: ${kw}`);
  }
});
