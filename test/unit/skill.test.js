import { test } from "node:test";
import assert from "node:assert/strict";
import { skill } from "../../src/skill.js";

test("skill has a valid kebab-case name and string source", () => {
  assert.match(skill.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(typeof skill.source, "string");
  assert.ok(skill.source.length > 0);
});

test("skill description carries routing keywords", () => {
  for (const kw of ["openEuler", "SIG", "CVE", "软件包", "oed_services", "web search"]) {
    assert.ok(skill.description.includes(kw), `description missing keyword: ${kw}`);
  }
});

test("skill body stays small and names all three tools", () => {
  assert.ok(skill.content.length < 8000, "skill body must stay under the 8k prune threshold");
  for (const tool of ["oed_services", "oed_operation_schema", "oed_invoke"]) {
    assert.ok(skill.content.includes(tool), `skill body missing tool: ${tool}`);
  }
});
