import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { OedError } from "./errors.js";

const execFileP = promisify(execFile);

/**
 * Run a git subprocess in `cwd`. Disables the credential helper so the PAT
 * embedded in the remote URL is never persisted to the OS keychain, and
 * redacts `secret` from any error surfaced to the caller.
 */
async function runGit(args, cwd, signal, secret) {
  try {
    await execFileP("git", ["-c", "credential.helper=", ...args], {
      cwd,
      signal,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
  } catch (err) {
    let detail = err?.stderr || err?.message || String(err);
    if (secret) detail = detail.replaceAll(secret, "<redacted>");
    throw new OedError(`git ${args[0]} failed: ${detail}`, {
      kind: "git_error",
      cause: err,
    });
  }
}

/**
 * Push files to a new branch of an existing fork (ADR-33 fallback: the
 * AtomGit contents API cannot create branches, so we use the git CLI).
 *
 * Shallow-clones the fork's `baseBranch`, checks out a new `branch`, writes
 * `files`, commits with `message`, and pushes. The PAT is embedded only in the
 * in-memory remote URL and never logged or persisted.
 */
export async function pushFilesToFork({
  forkPath,
  forkOwner,
  token,
  baseBranch,
  branch,
  files,
  message,
  authorName,
  authorEmail,
  signal,
}) {
  const remoteUrl = `https://${encodeURIComponent(forkOwner)}:${encodeURIComponent(token)}@atomgit.com/${forkPath}.git`;
  const dir = await mkdtemp(join(tmpdir(), "oed-fork-push-"));
  try {
    await runGit(
      ["clone", "--depth", "1", "--branch", baseBranch, "--single-branch", remoteUrl, dir],
      undefined,
      signal,
      token,
    );
    await runGit(["checkout", "-b", branch], dir, signal, token);
    for (const f of files) {
      const fp = join(dir, f.path);
      await mkdir(dirname(fp), { recursive: true });
      await writeFile(fp, f.content ?? "", "utf-8");
    }
    await runGit(["add", "-A"], dir, signal, token);
    const commitArgs = [];
    if (authorName) commitArgs.push("-c", `user.name=${authorName}`);
    if (authorEmail) commitArgs.push("-c", `user.email=${authorEmail}`);
    await runGit([...commitArgs, "commit", "-m", message], dir, signal, token);
    await runGit(["push", "-u", "origin", branch], dir, signal, token);
    return { ok: true, forkPath, owner: forkOwner, branch, head: `${forkOwner}:${branch}` };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
