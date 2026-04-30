# jupyterlab-run-python

JupyterLab 4 extension to run `.py` scripts quickly from the editor and file browser.

## Compatibility targets

- Python: `>=3.11,<4.0`
- JupyterLab: `>=4.0,<5.0`
- Node.js (build/dev): `>=20`

## Scope

- `Run Python File` for quick execution.
- `Run Python File (Advanced)` for custom kernel, args, env vars, and working directory.
- Terminal-backed execution with a new terminal tab per run.

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
- CI phase will enforce `npm run build` and `npm test`.

## License

BSD-3-Clause.

## Attribution

This project design is loosely inspired by `gavincyi/jupyterlab-executor` (BSD-3-Clause), but is being implemented with a different UX focus (`.py` editor button + file browser right-click flow).
