# Code Review Checklist

Generated from code review of `jupyterlab-run-python`. All 42 tests pass and typecheck is clean.

## Packages

- [x] **Upgrade `vitest` from 2.1.9 to 4.x** — two major versions behind; the CJS deprecation warning on every test run is a direct result of vitest 2.x using the old Vite CJS API. Update the range in `package.json` from `^2.1.8` to `^4.0.0` and run `npm install`.
- [x] **Upgrade `typescript` from 5.9.3 to 6.x** — one major version behind. TypeScript 6 tightens module resolution and drops some legacy emit modes. Low urgency but worth tracking given this project uses `"module": "esnext"`.

## `tsconfig.json`

- [x] **Fix `"include": ["src/*"]` → `"src/**/*"`** — the glob `*` does not recurse into subdirectories. Any files added under `src/utils/`, `src/components/`, etc. will be silently skipped by the compiler.
- [x] **Change `"moduleResolution": "node"` → `"bundler"`** — `"node"` resolution paired with `"module": "esnext"` applies CommonJS-era lookup rules to ESM output. The correct value for JupyterLab extensions (which use webpack via `@jupyterlab/builder`) is `"bundler"`. No visible runtime bug today, but TypeScript is not checking imports the same way the bundler resolves them.
- [x] **Bump `"lib": ["dom", "es2018"]` to `"es2020"` or `"es2022"`** — `es2018` predates `Object.fromEntries`, `Promise.allSettled`, optional chaining, and nullish coalescing. Bumping enables cleaner patterns for future code.

## `src/index.ts`

- [x] **Fix `envMapToText` newline corruption** — `envMapToText` converts `defaultEnv` to a `KEY=value` string for the dialog, then `parseEnvText` parses it back. Any env value containing a newline will be silently split into two lines, with the second becoming an invalid key. Either escape newlines in values, reject them at settings-read time, or pass the env map directly to `AdvancedRunForm` and avoid the round-trip.
- [x] **Improve `getTrackedTerminalWidget` terminal lookup** — currently iterates all open terminal widgets via `forEach` with an external mutable `matched` variable to find one by ID. Check if the Lumino tracker exposes `.find()` and use it; if not, consider storing a direct widget reference alongside `preferredReusableTerminalId` to avoid the scan.

## `src/execution.ts` / `src/advanced-utils.ts`

- [x] **Make invalid env key handling consistent** — `buildEnvPrefix` silently drops keys with invalid names (characters outside `[A-Za-z_][A-Za-z0-9_]*`), while `parseEnvText` throws on the same keys. Invalid keys from `defaultEnv` (settings) are silently dropped with no user feedback; the same keys entered in the Advanced dialog show an error. Either warn in both places or reject at settings-read time in `readRunnerSettings`.

## `src/advanced.ts`

- [x] **Move inline styles to `style/index.css`** — all form layout (`display: block`, `marginTop`, `width: 100%`, etc.) is set via inline JS `style` assignments. `style/index.css` exists but contains only a placeholder comment. Moving these to CSS classes makes the form theme-aware and allows JupyterLab theme overrides to target extension elements via class selectors.

## `package.json` scripts

- [x] **Add a real linter (ESLint or Biome)** — `npm run lint` is currently just `tsc --noEmit` (identical to `typecheck`). TypeScript strict mode catches type errors but not unused imports, floating promises, import ordering, or other common pitfalls. The release checklist in `VERSIONING.md` lists `npm run lint` as a pre-release gate, so this should be a distinct check. JupyterLab's own extensions use ESLint with `@typescript-eslint`.

## Tests

- [x] **Add tests for `AdvancedRunForm` (`src/advanced.ts`)** — `tests/advanced.test.ts` only imports from `advanced-utils.ts`; the `AdvancedRunForm` Widget class has zero coverage. The form's `getValue()` method (the integration between DOM inputs and the returned `AdvancedRunValues`) is untested. Add `environment: 'jsdom'` to the vitest config (or a per-file override) to enable DOM testing.
