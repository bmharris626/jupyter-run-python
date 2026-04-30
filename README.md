# jupyterlab-run-python

`jupyterlab-run-python` is a JupyterLab 4 extension that adds one-click Python script execution from the file editor and file browser.

It is designed for users who edit `.py` files in JupyterLab and want fast execution in a terminal without manually copying commands.

## What this extension does

- Adds `Run` and `Run Advanced` actions for Python files.
- Supports command resolution from active kernel context or default settings.
- Executes scripts in JupyterLab terminals with a transparent command preview.
- Adds quick actions to re-run or stop the most recent run.
- Supports per-file recent argument presets in `Run Advanced`.

## Compatibility

- Python: `>=3.11,<4.0`
- JupyterLab: `>=4.0,<5.0`
- Node.js (build/dev): `>=20`

## How it works

### Run

`Run` resolves the target `.py` file from the current editor or file browser selection, builds the execution command, and sends it to a JupyterLab terminal.

Command source order:

1. Active kernel name mapped through `kernelCommandMap`.
2. Active kernel kernelspec absolute interpreter (`argv[0]`) when available.
3. Fallback `defaultPythonCommand`.

Script path behavior:

- If `serverRootPath` is set, script paths are resolved to absolute filesystem paths (`<serverRootPath>/<contents-path>`).
- This is the recommended mode for JupyterHub to avoid cwd/path mismatch issues.

### Run Advanced

`Run Advanced` opens a dialog where you can set:

- Kernel profile
- Command override (for example `python3`, `uv run python`, `poetry run python`)
- Script arguments
- Environment variables (`KEY=value`, one per line)
- Working directory
- Save args as recent preset for that file

### Terminal behavior

- Shows the full command first for transparency.
- Supports either:
  - new terminal per run (`openNewTerminalPerRun=true`), or
  - reuse terminal mode (`openNewTerminalPerRun=false`).
- Includes:
  - `python-runner:rerun-latest`
  - `python-runner:stop-latest`

## Install (local development)

From this repository root:

```bash
npm ci
npm run build
jupyter labextension install . --no-build
jupyter lab build
```

Verify:

```bash
jupyter labextension list
```

You should see `jupyterlab-run-python` enabled.

## Install for JupyterHub validation

This project currently ships as a JupyterLab extension package (not a `pip`/`conda` Python package wrapper yet).

For JupyterHub validation, install it into the same environment used by your single-user Jupyter server.

### Option A: admin-managed environment (recommended)

Run in the JupyterHub single-user image/env during build or provisioning:

```bash
npm ci
npm run build
jupyter labextension install /path/to/jupyter-run-python --no-build
jupyter lab build
```

### Option B: user-level validation (if terminal access is allowed)

In a JupyterHub terminal:

```bash
git clone <repo-url> ~/jupyter-run-python
cd ~/jupyter-run-python
npm ci
npm run build
jupyter labextension install . --no-build
jupyter lab build
```

If your JupyterHub deployment has readonly system paths, use the environment or image build path instead of per-user install.

Recommended JupyterHub setting for reliable path execution:

- Set `serverRootPath` to the single-user server filesystem root that matches Jupyter contents paths (for example `/home/jovyan`).

## JupyterHub notebook validation test

Use this to confirm end-to-end behavior after install.

1. In JupyterLab, create `validation_script.py` with:

```python
import os
print("validation ok")
print("cwd:", os.getcwd())
```

2. Open `validation_script.py` in the file editor.
3. Click `Run` in the editor toolbar.
4. Confirm a terminal opens and prints:
   - the command preview
   - `validation ok`
5. Run command palette action `Re-run Last Python Command` and confirm it executes again.
6. Run command palette action `Stop Last Python Run` while a longer script is running and confirm interruption.
7. Open `Run Advanced`, add args like `--demo value`, check save preset, run, then reopen advanced dialog and confirm the preset appears.

## Commands

- `python-runner:run`
- `python-runner:run-advanced`
- `python-runner:rerun-latest`
- `python-runner:stop-latest`
- `python-runner:about`

## Settings

Defined in `schema/plugin.json`:

- `defaultPythonCommand`
- `kernelCommandMap`
- `openNewTerminalPerRun`
- `defaultEnv`
- `defaultCwdMode`
- `showRunButtonInEditor`
- `recentArgsPresets`
- `serverRootPath`

## Developer checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Status

Phased implementation status is tracked in `BUILD_CHECKLIST.md`.

## License

BSD-3-Clause.
