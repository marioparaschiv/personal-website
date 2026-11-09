# Repository Guide for Agents

> `CLAUDE.md` is a symlink to this file. Edit `AGENTS.md` only.

# Workflow

- Use `pnpm <script>` for everything. Don't invoke `tsx`, `vitest`, `oxlint`, etc. directly when a script exists.
- After editing code, run (in this order): `pnpm fmt`, `pnpm lint`, `pnpm typecheck`.
- For tests, prefer the per-project script (`pnpm backend:test`, `pnpm db:test`, …). Only run `pnpm test` when changes span many packages.
- Don't commit unless explicitly asked. Husky + commitlint enforces angular-style messages.
- Plans: extremely concise. Use `AskUserQuestion` for unresolved questions instead of guessing.

# Code Style

- **Tabs.** Always. (`oxfmt` enforces tab-width 4, single quotes, semis, trailing commas, 100 col.)
- `export default` at the bottom of the file.
- Comments explain _why_, not _what_. No section headers, step numbers, or paraphrased code.
- **No narrator comments.** Don't restate what the next line of code already shows (e.g. above `if (foo instanceof X)`, don't write `// check if foo is an X`; above a destructure, don't write `// pull out a, b, c`; above a sort, don't write `// sort the array`). Only add a comment if the code has a non-obvious side effect, an external invariant, a subtle ordering requirement, a known platform/library quirk, or a workaround whose absence would surprise a future reader. If removing the comment would not confuse anyone, don't write it.
- **Breathe.** Group related statements; separate unrelated ones with a blank line. Put a blank line before and after every loop, `if`/`switch` block, `try`, early-return guard, and any multi-line expression. Blank line between variable declarations and the work that uses them, and before every `return` that isn't the only statement in its block. Dense walls of code are a bug — readability beats line count.

# TypeScript

- No `as any`. No silent casts. Type precisely; if a type is hard, that's a signal worth investigating.
- Extract every non-trivial object type to a top-level `type` alias. Inline object types in params/returns/generics (e.g. `(x: { id: string }) => …`) are banned.
- Prefer `type` over `interface`. Use `interface` only when the shape will be `extends`-ed.
- `verbatimModuleSyntax` is on — use `import type` for type-only imports.

# React

- Wrap event handlers passed to memoized components in `useCallback` when their deps would otherwise be unstable.

# Packages

- Look up versions with `pnpm info <pkg> version` — never guess from training data.
- Respect existing constraints in `package.json` and the `pnpm-workspace.yaml` catalog.
- Shared dev deps (`typescript`, `vitest`, `drizzle-*`, `zod`, etc.) live in the catalog — reference them as `"dep": "catalog:"`.

# Communication

- Concise. No flattery, no emoji, no padding.
- Summarize what changed and why. Skip what didn't change.
- Commits: angular conventional-commits, scope = the package or app touched (e.g. `feat(backend): …`, `fix(db): …`, `chore(web): …`).