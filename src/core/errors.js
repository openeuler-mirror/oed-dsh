/** Error model shared by core and tools. `kind` names mirror oed-cli's contract. */

export class OedError extends Error {
  constructor(message, { kind = "error", hint, raw, status, cause, retryable = false } = {}) {
    super(message, { cause });
    this.name = "OedError";
    this.kind = kind;
    this.hint = hint;
    this.raw = raw;
    this.status = status;
    this.retryable = retryable;
  }
}

/** Turn any error into the single line surfaced to the model. */
export function toToolErrorMessage(err) {
  if (err instanceof OedError) {
    const hint = err.hint ? ` — hint: ${err.hint}` : "";
    return `[oed] ${err.kind}: ${err.message}${hint}`;
  }
  return `[oed] ${err instanceof Error ? err.message : String(err)}`;
}
