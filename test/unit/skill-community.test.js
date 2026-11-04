import { test } from "node:test";
import assert from "node:assert/strict";
import { skill } from "../../src/skill-community.js";

test("oed-community skill has a valid name and routing description", () => {
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(typeof skill.source, "string");
  for (const kw of ["forum", "search", "meeting", "软件包", "非 CVE"]) {
    assert.ok(skill.description.includes(kw), `description missing keyword: ${kw}`);
  }
});

test("oed-community skill body names the quirks and tools", () => {
  assert.ok(skill.content.length < 8000, "skill body must stay under the 8k prune threshold");
  for (const tool of ["oed_services", "oed_operation_schema", "oed_invoke"]) {
    assert.ok(skill.content.includes(tool), `body missing tool: ${tool}`);
  }
  for (const kw of [
    "gateway_managed_param",
    "searchSigByKeyword",
    "listMeetings",
    "托管头",
    "顶层",
  ]) {
    assert.ok(skill.content.includes(kw), `body missing keyword: ${kw}`);
  }
});
