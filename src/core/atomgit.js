import { requestJson, requestText, buildHeaders } from "./http.js";
import { OedError } from "./errors.js";

const ATOMGIT_API = "https://atomgit.com/api/v5";

/** Split "OWNER/REPO[/...]" into { owner, repo }. */
export function parseRepo(repo) {
  if (typeof repo !== "string" || !repo.includes("/")) {
    throw new OedError("repo must be OWNER/REPO, e.g. src-openeuler/ffmpeg", {
      kind: "invalid_input",
    });
  }
  const [owner, ...rest] = repo.split("/");
  return { owner, repo: rest.join("/") };
}

/**
 * Normalize an issue reference into { owner, repo, number }.
 * `repo` must be OWNER/REPO; `number` may be a number, a "#N" suffix, or a
 * full `https://atomgit.com/OWNER/REPO/issues/N` URL.
 */
export function parseIssueRef(repo, number) {
  if (typeof number === "string" && number.includes("atomgit.com")) {
    const m = number.match(/atomgit\.com\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/(\d+)/);
    if (!m) throw new OedError(`cannot parse issue URL: ${number}`, { kind: "invalid_input" });
    return { owner: m[1], repo: m[2], number: Number(m[3]) };
  }
  const { owner, repo: r } = parseRepo(repo);
  const n = Number(String(number).replace("#", ""));
  if (!Number.isInteger(n) || n <= 0) {
    throw new OedError(`invalid issue number: ${number}`, { kind: "invalid_input" });
  }
  return { owner, repo: r, number: n };
}

export async function fetchIssue(owner, repo, number, { signal } = {}) {
  const { data } = await requestJson(`${ATOMGIT_API}/repos/${owner}/${repo}/issues/${number}`, {
    signal,
  });
  return {
    number: data?.number,
    title: data?.title ?? "",
    state: data?.state ?? "",
    html_url: data?.html_url ?? "",
    body: data?.body ?? "",
  };
}

export async function fetchIssueComments(owner, repo, number, { signal } = {}) {
  const { data } = await requestJson(
    `${ATOMGIT_API}/repos/${owner}/${repo}/issues/${number}/comments`,
    { signal },
  );
  return (Array.isArray(data) ? data : []).map((c) => ({
    id: c?.id,
    user: c?.user?.login,
    created_at: c?.created_at,
    body: c?.body ?? "",
  }));
}

function requireAtomgitToken(token) {
  if (!token) {
    throw new OedError("AtomGit token is not configured", {
      kind: "atomgit_token_missing",
      hint: "set ATOMGIT_TOKEN, or config.atomgitToken; create a PAT at https://atomgit.com/setting/token-classic/create",
    });
  }
}

function redactToken(err, token) {
  if (err instanceof OedError) {
    err.message = err.message.replaceAll(token, "<redacted>");
    if (err.hint) err.hint = err.hint.replaceAll(token, "<redacted>");
  }
  return err;
}

/**
 * Post an issue comment directly to AtomGit (no openEuler gateway involved).
 * Auth is an AtomGit personal access token passed as the `access_token` query
 * parameter. The token is redacted from any thrown error message.
 */
export async function postIssueComment(owner, repo, number, body, { token, signal } = {}) {
  requireAtomgitToken(token);
  const base = `${ATOMGIT_API}/repos/${owner}/${repo}/issues/${number}/comments`;
  const url = `${base}?access_token=${encodeURIComponent(token)}`;
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: { body },
      signal,
    });
    return {
      ok: true,
      id: data?.id == null ? null : String(data?.id),
      url: `${ATOMGIT_API.replace("/api/v5", "")}/${owner}/${repo}/issues/${number}`,
    };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/** Create an issue. The owner is in the path, repo in the body (AtomGit convention). */
export async function createIssue(owner, repo, { title, body, token, signal } = {}) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/repos/${owner}/issues?access_token=${encodeURIComponent(token)}`;
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: { repo, title, body },
      signal,
    });
    return {
      ok: true,
      number: data?.number,
      html_url: data?.html_url ?? data?.web_url,
    };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/**
 * Create a pull request against an AtomGit repo (fork → upstream supported).
 * `head` is "branch" for same-repo or "forkOwner:branch" for cross-repo;
 * `forkPath` is the fork's "owner/repo" and is required for cross-repo PRs.
 */
export async function createPullRequest(
  owner,
  repo,
  { title, head, base, body, forkPath, issueNums, token, signal } = {},
) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/repos/${owner}/${repo}/pulls?access_token=${encodeURIComponent(token)}`;
  const payload = {
    title,
    head,
    base,
    ...(body ? { body } : {}),
    ...(forkPath ? { fork_path: forkPath } : {}),
    ...(issueNums ? { inner_issue_nums: issueNums } : {}),
  };
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: payload,
      signal,
    });
    return {
      ok: true,
      number: data?.number,
      html_url: data?.html_url ?? data?.web_url,
    };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/** Fetch a raw file (text) from a branch. */
export async function fetchRawFile(owner, repo, branch, path, { signal } = {}) {
  const { text } = await requestText(
    `${ATOMGIT_API}/repos/${owner}/${repo}/raw/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
    { signal },
  );
  return text;
}

/** Extract the `Version:` field from an rpm spec file. */
export function extractSpecVersion(specText = "") {
  const match = String(specText).match(/^Version:\s*(\S+)/m);
  return match ? match[1] : null;
}

export async function listRepoRoot(owner, repo, branch, { signal } = {}) {
  const { data } = await requestJson(
    `${ATOMGIT_API}/repos/${owner}/${repo}/contents/?ref=${encodeURIComponent(branch)}`,
    { signal },
  );
  return Array.isArray(data) ? data : [];
}

/**
 * Read the `Version:` of each branch's spec file. The spec is normally
 * `<repo>.spec` at the repo root; if absent, fall back to the first *.spec in
 * the root listing. Each branch resolves independently so one failure does not
 * lose the rest.
 */
export async function fetchBranchSpecVersions(owner, repo, branches, { signal } = {}) {
  const pkg = repo.split("/").pop();
  const results = [];
  for (const branch of branches) {
    try {
      let text;
      try {
        text = await fetchRawFile(owner, repo, branch, `${pkg}.spec`, { signal });
      } catch (err) {
        if (err?.kind !== "upstream_error" || err?.status !== 404) throw err;
        const entries = await listRepoRoot(owner, repo, branch, { signal });
        const spec = entries.find((e) => e?.name?.endsWith(".spec"));
        if (!spec) {
          throw new OedError(`no .spec found in ${owner}/${repo}@${branch}`, {
            kind: "spec_missing",
          });
        }
        text = await fetchRawFile(owner, repo, branch, spec.name, { signal });
      }
      results.push({ branch, version: extractSpecVersion(text) });
    } catch (err) {
      results.push({ branch, version: null, error: err?.kind ?? err?.message ?? String(err) });
    }
  }
  return results;
}

/** Get the current authenticated user's login (ADR-32/37 direct AtomGit). */
export async function currentUser({ token, signal } = {}) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/user?access_token=${encodeURIComponent(token)}`;
  try {
    const { data } = await requestJson(url, { signal });
    return { login: data?.login ?? "", name: data?.name ?? "" };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/** Probe a repo; returns null when it does not exist (HTTP 404). */
export async function getRepo(owner, repo, { token, signal } = {}) {
  const query = token ? `?access_token=${encodeURIComponent(token)}` : "";
  try {
    const { data } = await requestJson(`${ATOMGIT_API}/repos/${owner}/${repo}${query}`, {
      signal,
    });
    return data;
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/** Fork a repo (non-idempotent); returns the fork's full_name. */
export async function forkRepo(owner, repo, { token, signal } = {}) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/repos/${owner}/${repo}/forks?access_token=${encodeURIComponent(token)}`;
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: {},
      signal,
    });
    return { forkPath: data?.full_name ?? "", created: true };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/** Ensure the current user has a fork of owner/repo (idempotent, ADR-33). */
export async function ensureFork(owner, repo, { token, signal } = {}) {
  const { login } = await currentUser({ token, signal });
  if (!login) {
    throw new OedError("cannot determine the AtomGit account for this token", {
      kind: "atomgit_token_invalid",
    });
  }
  const existing = await getRepo(login, repo, { token, signal });
  if (existing) return { forkPath: `${login}/${repo}`, forkOwner: login, created: false };
  const { forkPath } = await forkRepo(owner, repo, { token, signal });
  return { forkPath, forkOwner: login, created: true };
}

/** Create a file on an existing branch (base64 content). */
export async function createRepoFile(
  owner,
  repo,
  { path, content, message, branch, token, signal } = {},
) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?access_token=${encodeURIComponent(token)}`;
  const payload = {
    content: Buffer.from(String(content ?? ""), "utf-8").toString("base64"),
    message,
    branch,
  };
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: payload,
      signal,
    });
    return { path, commit: data?.commit?.sha ?? null };
  } catch (err) {
    throw redactToken(err, token);
  }
}

/** Fetch a single pull request (title, description, source/target branch, state). */
export async function fetchPullRequest(owner, repo, number, { signal } = {}) {
  const { data } = await requestJson(`${ATOMGIT_API}/repos/${owner}/${repo}/pulls/${number}`, {
    signal,
  });
  return {
    number: data?.number,
    title: data?.title ?? "",
    body: data?.description ?? data?.body ?? "",
    state: data?.state ?? "",
    head: data?.source_branch ?? data?.head?.ref ?? "",
    base: data?.target_branch ?? data?.base?.ref ?? "",
    html_url: data?.html_url ?? data?.web_url,
  };
}

/** Fetch the file changes of a pull request. */
export async function fetchPullRequestFiles(owner, repo, number, { signal } = {}) {
  const { data } = await requestJson(
    `${ATOMGIT_API}/repos/${owner}/${repo}/pulls/${number}/files`,
    { signal },
  );
  return (Array.isArray(data) ? data : []).map((f) => ({
    filename: f?.filename ?? f?.path ?? f?.new_path ?? "",
    status: f?.status ?? "",
    additions: f?.additions,
    deletions: f?.deletions,
    patch: f?.patch ?? "",
  }));
}

/** Fetch the issues linked to a pull request. */
export async function fetchPullRequestIssues(owner, repo, number, { signal } = {}) {
  const { data } = await requestJson(
    `${ATOMGIT_API}/repos/${owner}/${repo}/pulls/${number}/issues`,
    { signal },
  );
  return (Array.isArray(data) ? data : []).map((i) => ({
    number: i?.number ?? i?.iid,
    title: i?.title ?? "",
    html_url: i?.html_url ?? i?.web_url,
  }));
}

/** Post a comment on a pull request (no openEuler gateway involved). */
export async function postPullRequestComment(owner, repo, number, body, { token, signal } = {}) {
  requireAtomgitToken(token);
  const url = `${ATOMGIT_API}/repos/${owner}/${repo}/pulls/${number}/comments?access_token=${encodeURIComponent(token)}`;
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: { body },
      signal,
    });
    return {
      ok: true,
      id: data?.id == null ? null : String(data?.id),
      url: data?.html_url ?? data?.web_url,
    };
  } catch (err) {
    throw redactToken(err, token);
  }
}
