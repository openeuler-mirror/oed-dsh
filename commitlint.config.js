export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Keep subjects reviewable in `git log --oneline`.
    "header-max-length": [2, "always", 72],
    // Bodies wrap at 100 columns for terminal/CLI readability.
    "body-max-line-length": [2, "always", 100],
  },
};
