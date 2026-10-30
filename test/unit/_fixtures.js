import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/** Read and parse a JSON fixture under test/fixtures/. */
export function readFixture(rel) {
  return JSON.parse(readFileSync(join(here, "..", "fixtures", rel), "utf8"));
}
