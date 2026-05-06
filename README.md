# jupyterlab-run-python

A JupyterLab 4 extension for running `.py` files directly from the editor toolbar or file browser, with execution in a JupyterLab terminal.

## Features

- **Run** and **Run Advanced** actions for `.py` files
- Toolbar buttons in the file editor for open scripts
- Context menu items in the file browser
- Kernel-aware command resolution with configurable fallbacks
- **Run Advanced** dialog: kernel selector, command override, arguments, environment variables, working directory, and per-file argument presets
- Terminal split: when running a script open in the editor, the terminal opens as a split panel below the editor
- Re-run and stop actions for the most recent execution
- Reactive settings — changes apply to the next run without a restart

## Compatibility

| | Version |
|---|---|
| JupyterLab | `>=4.0, <5` |
| Python | `>=3.11` |
| Node.js (build only) | `>=20` |

## Installation

```bash
pip install jupyterlab-run-python
```

Verify the extension loaded:

```bash
jupyter labextension list
```

## Usage

### Run

Click the **Run** button in the editor toolbar (when a `.py` file is open), or right-click a `.py` file in the file browser and choose **Run Python File**.

Command resolution order:

1. Active kernel name → `kernelCommandMap` setting
2. Active kernel's absolute interpreter path from kernelspecs
3. `defaultPythonCommand` setting (default: `python3`)

### Run Advanced

Opens a dialog before execution where you can configure:

- **Kernel** — selects the Python interpreter profile
- **Command override** — e.g. `uv run python`, `poetry run python`
- **Arguments** — appended to the script path
- **Environment variables** — `KEY=value`, one per line, merged with `defaultEnv`
- **Working directory** — overrides `defaultCwdMode`
- **Save as preset** — saves args for that file (up to 5 per file, accessible next time)

### Terminal behavior

- Running from the **editor** opens a split terminal below the editor at a 70/30 ratio
- Running from the **file browser** opens the terminal as a new tab
- `openNewTerminalPerRun=false` reuses the same terminal across runs

### Re-run / Stop

- **Re-run Last Python Command** (`python-runner:rerun-latest`) — available in the command palette
- **Stop Python Run** (`python-runner:stop-latest`) — sends Ctrl+C to the active terminal; also shown as a toolbar button

## Settings

Open **Settings → Advanced Settings Editor → Python Runner** to configure:

| Setting | Default | Description |
|---|---|---|
| `defaultPythonCommand` | `python3` | Fallback interpreter when no kernel mapping exists |
| `kernelCommandMap` | `{}` | Map kernel name → command template (`{python}`, `{script}`, `{args}`) |
| `openNewTerminalPerRun` | `false` | Open a fresh terminal for every run |
| `defaultEnv` | `{}` | Environment variables applied to every run |
| `defaultCwdMode` | `script_dir` | Working directory: `script_dir`, `workspace_root`, or `server_root` |
| `showRunButtonInEditor` | `true` | Show Run/Stop buttons in the editor toolbar |
| `serverRootPath` | `""` | Absolute server filesystem root (recommended for JupyterHub) |
| `recentArgsPresets` | `{}` | Persisted per-file argument history (managed automatically) |

### JupyterHub

Set `serverRootPath` to the single-user server filesystem root (e.g. `/home/jovyan`) so that Jupyter contents paths are resolved to correct absolute filesystem paths.

## Commands

| Command ID | Description |
|---|---|
| `python-runner:run` | Run the current `.py` file |
| `python-runner:run-advanced` | Run with advanced options dialog |
| `python-runner:rerun-latest` | Re-run the last command |
| `python-runner:stop-latest` | Stop the running script (Ctrl+C) |

All commands are accessible from the command palette under the **Python Runner** category.

## Development

```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test

# Build the JupyterLab prebuilt extension bundle
npm run build:labextension

# Install into active JupyterLab environment
pip install .
```

## License

MIT
