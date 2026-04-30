# jupyterlab-run-python

JupyterLab 4 extension to run `.py` scripts quickly from the editor and file browser.

## Quickstart

### 1) Build and test

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm test
```

### 2) Install into local JupyterLab 4 environment

```bash
jupyter labextension install . --no-build
jupyter lab build
```

### 3) Use the extension

- Open any `.py` file in the editor and click `Run` or `Run Advanced` in the toolbar.
- Or right-click a `.py` file in the file browser and select `Run Python File`.
- Output is executed in a terminal tab and the full command is printed first for transparency.

## Screenshots / GIF

- Screenshot/GIF capture is planned as part of release polish.
- Current implementation is testable via the quickstart steps above.

## Compatibility targets

- Python: `>=3.11,<4.0`
- JupyterLab: `>=4.0,<5.0`
- Node.js (build/dev): `>=20`

## Scope

- `Run Python File` for quick execution.
- `Run Python File (Advanced)` for custom kernel, args, env vars, and working directory.
- Terminal-backed execution with a new terminal tab per run.

## Install notes

- This repository currently ships as a JupyterLab prebuilt extension project.
- A Python package wrapper (`pip`/`conda`) is not yet included.
- Until wrapper packaging is added, install via `jupyter labextension install . --no-build`.

## Commands and settings

- Command IDs:
  - `python-runner:run`
  - `python-runner:run-advanced`
  - `python-runner:rerun-latest`
  - `python-runner:stop-latest`
- Settings schema: `schema/plugin.json`
  - `defaultPythonCommand`
  - `kernelCommandMap`
  - `openNewTerminalPerRun`
  - `defaultEnv`
  - `defaultCwdMode`
  - `showRunButtonInEditor`
  - `recentArgsPresets`

## Status

This repository is under active build-out by major phases described in `BUILD_CHECKLIST.md`.

## Dependency policy

- Keep direct dependencies minimal and add new ones only when a phase needs them.
- Prefer official JupyterLab packages and actively maintained projects.
- Re-check transitive dependency health during each major phase checkpoint.
- `node_modules/` is local-only and ignored by git.

## Testing policy

- Each major phase must include automated tests for changed behavior.
- Minimum per phase: unit tests for new logic plus a manual verification checklist update.
- CI enforces `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test`.

## Release docs

- Changelog: `CHANGELOG.md`
- Versioning plan: `VERSIONING.md`

## License

BSD-3-Clause.

## Attribution

This project design is loosely inspired by `gavincyi/jupyterlab-executor` (BSD-3-Clause), but is being implemented with a different UX focus (`.py` editor button + file browser right-click flow).
