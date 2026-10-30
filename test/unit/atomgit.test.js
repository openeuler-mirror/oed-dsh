import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseIssueRef,
  fetchIssue,
  fetchIssueComments,
  extractSpecVersion,
  fetchBranchSpecVersions,
  postIssueComment,
  createPullRequest,
  fetchPullRequest,
  fetchPullRequestFiles,
  postPullRequestComment,
  currentUser,
  getRepo,
  forkRepo,
  ensureFork,
  createRepoFile,
} from "../../src/core/atomgit.js";

test("parseIssueRef handles OWNER/REPO + number", () => {
  assert.deepEqual(parseIssueRef("src-openeuler/ffmpeg", 267), {
    owner: "src-openeuler",
    repo: "ffmpeg",
    number: 267,
  });
  assert.deepEqual(parseIssueRef("src-openeuler/ffmpeg", "#267"), {
    owner: "src-openeuler",
    repo: "ffmpeg",
    number: 267,
  });
});

test("parseIssueRef handles a full issue URL", () => {
  assert.deepEqual(
    parseIssueRef("ignored", "https://atomgit.com/src-openeuler/ffmpeg/issues/267"),
    { owner: "src-openeuler", repo: "ffmpeg", number: 267 },
  );
});

test("parseIssueRef rejects bad input", () => {
  assert.throws(
    () => parseIssueRef("ffmpeg", 1),
    (e) => e.kind === "invalid_input",
  );
});

test("fetchIssue returns a parsed issue", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ number: 267, title: "CVE-x", state: "open", body: "hello" }), {
      status: 200,
    });
  const issue = await fetchIssue("src-openeuler", "ffmpeg", 267);
  assert.equal(issue.number, 267);
  assert.equal(issue.state, "open");
  assert.equal(issue.body, "hello");
});

test("fetchIssueComments maps user and body", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify([{ id: 1, user: { login: "bot" }, body: "x" }]), { status: 200 });
  const comments = await fetchIssueComments("src-openeuler", "ffmpeg", 267);
  assert.equal(comments.length, 1);
  assert.equal(comments[0].user, "bot");
});

test("extractSpecVersion parses Version from a spec", () => {
  assert.equal(extractSpecVersion("Name: mariadb\nVersion: 10.5.12\nRelease: 1"), "10.5.12");
  assert.equal(extractSpecVersion("no version field"), null);
});

test("fetchBranchSpecVersions reads each branch spec", async () => {
  const versions = {
    "openEuler-22.03-LTS-SP4": "10.5.16",
    "openEuler-24.03-LTS": "10.11.6",
  };
  globalThis.fetch = async (url) => {
    const s = String(url);
    if (s.includes("/raw/mariadb.spec")) {
      const ref = s.match(/ref=([^&]+)/)[1];
      return new Response(`Name: mariadb\nVersion: ${versions[ref] ?? "10.5.12"}\n`, {
        status: 200,
      });
    }
    return new Response("not found", { status: 404 });
  };
  const rows = await fetchBranchSpecVersions("src-openeuler", "mariadb", [
    "openEuler-22.03-LTS-SP4",
    "openEuler-24.03-LTS",
  ]);
  assert.deepEqual(rows, [
    { branch: "openEuler-22.03-LTS-SP4", version: "10.5.16" },
    { branch: "openEuler-24.03-LTS", version: "10.11.6" },
  ]);
});

test("postIssueComment posts directly to AtomGit with access_token", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), method: init.method, body: init.body, headers: init.headers };
    return new Response(JSON.stringify({ id: 42, body: "x" }), { status: 200 });
  };
  const result = await postIssueComment("src-openeuler", "mariadb", 339, "评论内容", {
    token: "PAT-secret",
  });
  assert.equal(result.ok, true);
  assert.equal(result.id, "42");
  assert.equal(captured.method, "POST");
  assert.ok(captured.url.includes("/repos/src-openeuler/mariadb/issues/339/comments"));
  assert.ok(captured.url.includes("access_token=PAT-secret"));
  assert.equal(JSON.parse(captured.body).body, "评论内容");
  assert.equal(captured.headers["Content-Type"], "application/json");
});

test("postIssueComment rejects a missing token without leaking it", async () => {
  await assert.rejects(
    () => postIssueComment("src-openeuler", "mariadb", 339, "x", { token: "" }),
    (e) => e.kind === "atomgit_token_missing",
  );
});

test("createPullRequest posts a fork→upstream PR and links the issue", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), method: init.method, body: init.body };
    return new Response(
      JSON.stringify({
        number: 12,
        html_url: "https://atomgit.com/src-openeuler/mariadb/pulls/12",
      }),
      { status: 200 },
    );
  };
  const result = await createPullRequest("src-openeuler", "mariadb", {
    title: "fix(cve): 修复 CVE-2026-107383 在 mariadb 中的漏洞",
    head: "kevin:fix-CVE-2026-107383",
    base: "master",
    body: "desc",
    forkPath: "kevin/mariadb",
    issueNums: "339",
    token: "PAT-secret",
  });
  assert.equal(result.ok, true);
  assert.equal(result.number, 12);
  assert.equal(captured.method, "POST");
  assert.ok(captured.url.includes("/repos/src-openeuler/mariadb/pulls"));
  const body = JSON.parse(captured.body);
  assert.equal(body.head, "kevin:fix-CVE-2026-107383");
  assert.equal(body.base, "master");
  assert.equal(body.fork_path, "kevin/mariadb");
  assert.equal(body.inner_issue_nums, "339");
});

test("fetchPullRequest maps source/target branches and description", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        number: 12,
        title: "fix(cve): ...",
        description: "desc",
        state: "open",
        source_branch: "fix-branch",
        target_branch: "master",
        html_url: "url",
      }),
      { status: 200 },
    );
  const pr = await fetchPullRequest("src-openeuler", "mariadb", 12);
  assert.equal(pr.number, 12);
  assert.equal(pr.head, "fix-branch");
  assert.equal(pr.base, "master");
  assert.equal(pr.body, "desc");
});

test("fetchPullRequestFiles maps filenames and patches", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify([
        { filename: "mariadb.spec", status: "modified", patch: "+Version: 10.5.30" },
      ]),
      { status: 200 },
    );
  const files = await fetchPullRequestFiles("src-openeuler", "mariadb", 12);
  assert.equal(files.length, 1);
  assert.equal(files[0].filename, "mariadb.spec");
  assert.ok(files[0].patch.includes("10.5.30"));
});

test("postPullRequestComment posts a PR comment", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), method: init.method, body: init.body };
    return new Response(JSON.stringify({ id: 7 }), { status: 200 });
  };
  const result = await postPullRequestComment("src-openeuler", "mariadb", 12, "review", {
    token: "PAT",
  });
  assert.equal(result.ok, true);
  assert.equal(captured.method, "POST");
  assert.ok(captured.url.includes("/pulls/12/comments"));
  assert.equal(JSON.parse(captured.body).body, "review");
});

test("currentUser returns the authenticated login", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ login: "kevin", name: "Kevin" }), { status: 200 });
  const user = await currentUser({ token: "PAT-secret" });
  assert.equal(user.login, "kevin");
  assert.equal(user.name, "Kevin");
});

test("getRepo returns null on 404 and the repo otherwise", async () => {
  globalThis.fetch = async () => new Response("nf", { status: 404 });
  assert.equal(await getRepo("kevin", "mariadb"), null);

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ full_name: "kevin/mariadb" }), { status: 200 });
  const repo = await getRepo("kevin", "mariadb");
  assert.equal(repo.full_name, "kevin/mariadb");
});

test("forkRepo posts to the forks endpoint with the token", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), method: init.method };
    return new Response(JSON.stringify({ full_name: "kevin/mariadb" }), { status: 201 });
  };
  const result = await forkRepo("src-openeuler", "mariadb", { token: "PAT-secret" });
  assert.equal(result.forkPath, "kevin/mariadb");
  assert.equal(result.created, true);
  assert.equal(captured.method, "POST");
  assert.ok(captured.url.includes("/repos/src-openeuler/mariadb/forks"));
  assert.ok(captured.url.includes("access_token=PAT-secret"));
});

test("ensureFork reuses an existing fork without re-forking", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), method: init?.method });
    if (url.includes("/user")) {
      return new Response(JSON.stringify({ login: "kevin" }), { status: 200 });
    }
    if (url.includes("/repos/kevin/mariadb")) {
      return new Response(JSON.stringify({ full_name: "kevin/mariadb" }), { status: 200 });
    }
    return new Response("{}", { status: 500 });
  };
  const result = await ensureFork("src-openeuler", "mariadb", { token: "PAT" });
  assert.deepEqual(result, { forkPath: "kevin/mariadb", forkOwner: "kevin", created: false });
  assert.equal(
    calls.some((c) => c.method === "POST"),
    false,
  );
});

test("ensureFork forks when the fork does not exist", async () => {
  globalThis.fetch = async (url, init) => {
    const s = String(url);
    if (s.includes("/user"))
      return new Response(JSON.stringify({ login: "kevin" }), { status: 200 });
    if (s.includes("/repos/kevin/mariadb")) return new Response("nf", { status: 404 });
    if (s.includes("/forks") && init?.method === "POST") {
      return new Response(JSON.stringify({ full_name: "kevin/mariadb" }), { status: 201 });
    }
    return new Response("{}", { status: 500 });
  };
  const result = await ensureFork("src-openeuler", "mariadb", { token: "PAT" });
  assert.deepEqual(result, { forkPath: "kevin/mariadb", forkOwner: "kevin", created: true });
});

test("createRepoFile posts base64 content and branch", async () => {
  let captured = null;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), body: JSON.parse(init.body) };
    return new Response(JSON.stringify({ commit: { sha: "abc123" } }), { status: 201 });
  };
  const result = await createRepoFile("kevin", "mariadb", {
    path: "mariadb.spec",
    content: "Version: 10.5.30\n",
    message: "fix CVE",
    branch: "fix-branch",
    token: "PAT",
  });
  assert.equal(result.path, "mariadb.spec");
  assert.equal(result.commit, "abc123");
  assert.equal(captured.body.branch, "fix-branch");
  assert.equal(captured.body.message, "fix CVE");
  assert.equal(
    Buffer.from(captured.body.content, "base64").toString("utf-8"),
    "Version: 10.5.30\n",
  );
});
