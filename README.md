# jupyterlab-run-python

[![PyPI](https://img.shields.io/pypi/v/jupyterlab-run-python.svg)](https://pypi.org/project/jupyterlab-run-python/)
[![CI](https://github.com/bmharris626/jupyter-run-python/actions/workflows/ci.yml/badge.svg)](https://github.com/bmharris626/jupyter-run-python/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A JupyterLab 4 extension for running `.py` files directly from the editor toolbar or file browser, with execution in a JupyterLab terminal.

## Description

Launch Python scripts from within JupyterLab using the **Run** and **Run Advanced** actions. The extension resolves the appropriate Python interpreter from the active kernel, supports command overrides and argument presets, and manages terminal lifecycle including split-panel mode and re-run/stop capabilities.

## Quick Start

```bash
pip install jupyterlab-run-python
```

Open JupyterLab, open a `.py` file, and click the **Run** button in the editor toolbar.

## Installation & Setup

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
- **Save as preset** — saves args for that file (up to 5 per file)

### Terminal behavior

- Running from the **editor** opens a split terminal below the editor at a 70/30 ratio.
- Running from the **file browser** opens the terminal as a new tab.
- `openNewTerminalPerRun=false` reuses the same terminal across runs.

### Re-run / Stop

- **Re-run Last Python Command** (`python-runner:rerun-latest`) — available in the command palette.
- **Stop Python Run** (`python-runner:stop-latest`) — sends Ctrl+C to the active terminal.

## Configuration Reference

Open **Settings → Advanced Settings Editor → Python Runner** to configure:

| Setting | Type | Default | Description |
|---|---|---|---|
| `defaultPythonCommand` | str | `python3` | Fallback interpreter when no kernel mapping exists |
| `kernelCommandMap` | object | `{}` | Map kernel name → command template (`{python}`, `{script}`, `{args}`) |
| `openNewTerminalPerRun` | bool | `false` | Open a fresh terminal for every run |
| `defaultEnv` | object | `{}` | Environment variables applied to every run |
| `defaultCwdMode` | str | `script_dir` | Working directory: `script_dir`, `workspace_root`, or `server_root` |
| `showRunButtonInEditor` | bool | `true` | Show Run/Stop buttons in the editor toolbar |
| `serverRootPath` | str | `""` | Absolute server filesystem root (recommended for JupyterHub) |
| `recentArgsPresets` | object | `{}` | Persisted per-file argument history (managed automatically) |

### JupyterHub

Set `serverRootPath` to the single-user server filesystem root (e.g. `/home/jovyan`) so that Jupyter contents paths are resolved to correct absolute filesystem paths.

## Project Structure

```
jupyterlab_run_python/              # Python package
├── __init__.py                     # Extension registration (no server component)
├── _version.py                     # Auto-generated from package.json
└── labextension/                   # webpack bundle
src/                                # TypeScript sources
├── index.ts                        # JupyterFrontEndPlugin entry
├── context.ts                      # .py file target resolution
├── kernel.ts                       # Kernel name → command resolution
├── settings.ts                     # ISettingRegistry parsing
├── execution.ts                    # Shell command building
├── advanced.ts                     # Run Advanced dialog widget
├── advanced-utils.ts               # Form value parsing/validation
├── edge.ts                         # Guard functions
└── env.ts                          # Environment handling
tests/                              # Vitest tests (Node env)
├── advanced-form.test.ts
├── advanced.test.ts
├── context.test.ts
├── edge.test.ts
├── execution.test.ts
├── kernel.test.ts
└── settings.test.ts
style/                              # CSS
└── index.css
schema/                             # Settings schema
└── plugin.json
.github/workflows/                  # CI (Python 3.11/3.12/3.13)
package.json
pyproject.toml
tsconfig.json
vitest.config.ts
LICENSE
CHANGELOG.md
```

| Command ID | Description |
|---|---|
| `python-runner:run` | Run the current `.py` file |
| `python-runner:run-advanced` | Run with advanced options dialog |
| `python-runner:rerun-latest` | Re-run the last command |
| `python-runner:stop-latest` | Stop the running script (Ctrl+C) |

All commands are accessible from the command palette under the **Python Runner** category.

## Contributing

- Run tests: `npm test` or `jlpm test`
- Single test file: `npx vitest run tests/execution.test.ts`
- Watch mode: `npm run test:watch`
- Build TypeScript: `npm run build`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Build labextension: `npm run build:labextension`
- Install into active JupyterLab: `pip install .`

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
