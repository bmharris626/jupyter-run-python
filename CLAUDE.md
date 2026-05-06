# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A JupyterLab 4 prebuilt extension (TypeScript + Python packaging) that adds `Run` and `Run Advanced` actions for `.py` files in the editor and file browser. Execution happens in a JupyterLab terminal. There is no server-side component — all logic is client-side TypeScript.

## Commands

```bash
# Install JS dependencies
npm ci

# Compile TypeScript → lib/
npm run build

# Type check (no emit)
npm run typecheck

# Run tests (vitest, node environment)
npm test

# Run a single test file
npx vitest run tests/execution.test.ts

# Watch mode for tests
npm run test:watch

# Build the JupyterLab prebuilt extension bundle (needed for pip install)
npm run build:labextension

# Install extension into active JupyterLab environment
pip install .

# Verify extension is loaded
jupyter labextension list
```

## Architecture

The extension has a single JupyterFrontEndPlugin (`src/index.ts`) that wires together all commands. All core logic lives in focused modules:

| Module | Responsibility |
|---|---|
| `src/context.ts` | Resolve which `.py` file is the run target (editor takes priority over file browser) |
| `src/kernel.ts` | Read active kernel name from current widget; resolve kernel → command template or absolute interpreter path from kernelspecs |
| `src/settings.ts` | Parse `ISettingRegistry` composite into typed `RunnerSettings`; resolve absolute script path using `serverRootPath`; resolve `defaultCwdMode` |
| `src/execution.ts` | Build shell commands: env prefix, shell quoting, template substitution (`{python}`, `{script}`, `{args}`), transparent preview wrapper, cwd wrapping |
| `src/advanced.ts` | Lumino `Widget` subclass that renders the Run Advanced dialog DOM |
| `src/advanced-utils.ts` | Parse and validate the raw form values from `AdvancedRunForm` |
| `src/edge.ts` | Small guards: `isLikelyPythonKernel`, `hasNonEmptyCommand` |

### Command resolution order (Run)

1. Kernel name → `kernelCommandMap` → template string
2. Kernel name → kernelspecs `argv[0]` (absolute path only)
3. `defaultPythonCommand` setting (default: `python3`)

### Script path resolution

If `serverRootPath` is set (recommended for JupyterHub), the Jupyter contents path is joined with it to produce an absolute filesystem path. Without it, the contents path is used as-is.

### Terminal execution

Commands are sent via `session.send({ type: 'stdin', ... })`. The extension tracks `latestRunCommand` and `latestRunTerminalId` in closure state for rerun and stop. Stop sends `` (Ctrl+C). Terminal reuse vs. new-per-run is controlled by `openNewTerminalPerRun`.

## Settings schema

Defined in `schema/plugin.json`, loaded via `ISettingRegistry`. Settings are re-read on every `changed` event. Key settings:

- `serverRootPath` — absolute path to Jupyter server filesystem root (critical for JupyterHub)
- `kernelCommandMap` — map kernel name → shell command or template
- `defaultCwdMode` — `script_dir` | `workspace_root` | `server_root`
- `recentArgsPresets` — persisted per-file args history (max 5 per file), written back via `loadedSettings.set()`

## Testing

Tests live in `tests/` and use vitest in a Node environment (no browser). Each source module has a corresponding test file. Tests import directly from `src/` TypeScript. There are no JupyterLab API mocks — modules under test are pure functions with no JupyterLab imports.

## Build outputs

- `npm run build` → `lib/` (TypeScript declarations + JS, used by tests and direct import)
- `npm run build:labextension` → `jupyterlab_run_python/labextension/` (webpack bundle for JupyterLab)
- `pip install .` triggers `hatch-jupyter-builder` which runs `build:labextension`

## Deployment

Git remotes:
- `n150`: `bmharris@n150:/git/jupyter-run-python` — homelab mirror, push after checkpoint commits
- `origin`: `https://github.com/bmharris/jupyter-run-python` — public GitHub
