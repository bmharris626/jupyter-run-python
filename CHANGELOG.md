# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-05-05

### Added

- `Run` and `Run Advanced` commands for `.py` files, accessible from the editor toolbar and file browser context menu
- Kernel-aware command resolution: active kernel → `kernelCommandMap` → kernelspec absolute interpreter → `defaultPythonCommand`
- `Run Advanced` dialog with kernel selector, command override, arguments, environment variables, working directory, and per-file argument presets (up to 5 per file)
- Terminal-backed execution with transparent command preview before running
- Split terminal behavior: running from the editor opens the terminal as a split panel below the editor (70/30); running from the file browser opens a new tab
- `python-runner:rerun-latest` command to re-run the last executed command
- `python-runner:stop-latest` command to send Ctrl+C to the active terminal
- Stop button in the editor toolbar
- Reactive settings via `ISettingRegistry` — changes apply to subsequent runs without restart
- `serverRootPath` setting for reliable absolute path resolution on JupyterHub
- `defaultCwdMode` setting: `script_dir`, `workspace_root`, or `server_root`
- `openNewTerminalPerRun` setting to control terminal reuse
- Non-Python kernel warning in advanced flow
- Unit tests for context resolution, kernel mapping, execution, advanced form parsing, settings, and edge guards
- ESLint + TypeScript strict mode linting
- GitHub Actions CI across Python 3.11, 3.12, 3.13
