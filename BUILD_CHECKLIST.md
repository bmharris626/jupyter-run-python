# JupyterLab 4 Python Script Runner Extension - Build Checklist

Goal: Build a JupyterLab 4.x extension that makes running `.py` files easy from both the editor and file browser, with `Run` and `Run Advanced` actions, using terminal-backed execution.

Repository rule: After each major phase (0-12), create a checkpoint commit and push/sync to the homelab git server at `n150:/git`.
Testing rule: Add or update automated tests in each major phase that changes behavior. Do not mark a phase complete without passing tests for that phase scope.

## 0) Project setup

- [x] Create project directory and initialize git repository.
- [x] Scaffold a JupyterLab 4 prebuilt extension (TypeScript).
- [x] Set package metadata (`name`, `description`, `license`, `repository`).
- [x] Set Node and Python version constraints in docs/CI.
- [x] Add BSD-3-Clause license and attribution note for reference inspiration (`jupyterlab-executor`).

## 1) Dependencies and baseline wiring

- [x] Add required JupyterLab packages:
  - [x] `@jupyterlab/application`
  - [x] `@jupyterlab/apputils`
  - [x] `@jupyterlab/filebrowser`
  - [x] `@jupyterlab/fileeditor`
  - [ ] `@jupyterlab/launcher` (optional)
  - [ ] `@jupyterlab/mainmenu` (optional)
  - [x] `@jupyterlab/services`
  - [x] `@lumino/widgets`
- [ ] Confirm extension activates in JupyterLab 4 dev mode.
- [x] Add `schema/plugin.json` and register settings loading.

## 2) Core command model

- [x] Define command IDs:
  - [x] `python-runner:run`
  - [x] `python-runner:run-advanced`
- [x] Register commands in command palette.
- [ ] Add keyboard shortcut placeholder (disabled by default or unbound).

Acceptance:
- [x] Commands appear in palette and execute a temporary stub action.

## 3) Context resolution (.py target detection)

- [x] Implement context resolver for target path:
  - [x] Active file editor document path (for toolbar run)
  - [x] File browser selected item path (for context menu run)
- [x] Validate `.py` extension.
- [x] Display clear warning if no valid `.py` target is found.

Acceptance:
- [x] For editor and browser, resolved script path is correct and logged/notified.

## 4) UI integration points

- [x] Add editor toolbar `Run` button for `.py` files.
- [x] Add optional toolbar secondary action or adjacent `Run Advanced` button.
- [x] Add file browser context menu items:
  - [x] `Run Python File`
  - [x] `Run Python File (Advanced)`
- [x] Add command palette labels and categories.

Acceptance:
- [x] Buttons/menu items show only when applicable and trigger the right command.

## 5) Terminal-backed execution engine

- [ ] Implement terminal session helper:
  - [ ] Always open a new terminal tab per run (MVP default)
  - [ ] Send command and stream output
  - [ ] Focus terminal on launch
- [ ] Implement robust shell quoting for file paths and args.
- [ ] Prefix env vars in command safely.
- [ ] Print expanded command before execution for transparency.

Acceptance:
- [ ] Running a script opens a new terminal and executes successfully.

## 6) Simple `Run` behavior

- [ ] Resolve active kernel context when available.
- [ ] Map kernel name/spec to command template via settings.
- [ ] Fallback to `defaultPythonCommand` when mapping is unavailable.
- [ ] Build and execute command for script path.

Suggested command template:
- [ ] ``{python} {script} {args}``

Acceptance:
- [ ] `Run` works with active Python kernel context and fallback path.

## 7) `Run Advanced` dialog

- [ ] Build modal dialog with fields:
  - [ ] Kernel selector (from kernelspecs)
  - [ ] Interpreter/command override
  - [ ] Args string
  - [ ] Env vars editor (key/value rows)
  - [ ] Working directory
- [ ] Validate input (bad env keys, empty required values).
- [ ] Convert dialog values into final terminal command.

Acceptance:
- [ ] User can run script with custom kernel/args/env/cwd from dialog.

## 8) Settings schema and defaults

- [ ] Implement `schema/plugin.json` with:
  - [ ] `defaultPythonCommand` (default `python3`)
  - [ ] `kernelCommandMap` (object map)
  - [ ] `openNewTerminalPerRun` (default `true`)
  - [ ] `defaultEnv` (object)
  - [ ] `defaultCwdMode` (`script_dir|workspace_root|server_root`)
  - [ ] `showRunButtonInEditor` (default `true`)
- [ ] Load and apply settings reactively.

Acceptance:
- [ ] Changing settings affects subsequent runs without rebuild.

## 9) Error handling and edge cases

- [ ] Handle missing interpreter command gracefully.
- [ ] Handle terminals API/session creation failures.
- [ ] Handle paths with spaces and special characters.
- [ ] Handle unsaved files or files not present on disk.
- [ ] Handle non-python kernels selected in advanced flow.

Acceptance:
- [ ] Failures show actionable error messages.

## 10) Tests and verification

Manual verification checklist:
- [ ] Run from open `.py` editor via toolbar.
- [ ] Run from file browser right-click menu.
- [ ] Run Advanced with args/env/cwd.
- [ ] Validate fallback when no active kernel is available.
- [ ] Validate behavior with path containing spaces.

Automated checks:
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] Extension installs into clean JupyterLab 4 environment.

## 11) Packaging and release readiness

- [ ] Add README with screenshots/GIF and quickstart.
- [ ] Add install instructions (`pip`/`conda` if Python package wrapper is used).
- [ ] Add changelog and versioning plan.
- [ ] Add CI for build + lint + typecheck.
- [ ] Verify license and attribution notices.

## 12) Post-MVP enhancements (optional)

- [ ] Add stop/re-run actions for latest terminal execution.
- [ ] Save recent args presets per file.
- [ ] Add project-level profiles (`python`, `uv run`, `poetry run python`).
- [ ] Add traceback link parsing back to source file.
- [ ] Add optional "reuse one terminal" mode.

---

## Definition of Done (MVP)

- [ ] JupyterLab 4.x extension is installable and discoverable.
- [ ] `.py` files can be run from editor button and file browser context menu.
- [ ] `Run` uses active kernel context with reliable fallback.
- [ ] `Run Advanced` supports kernel/args/env/cwd.
- [ ] Execution is terminal-backed with a new terminal tab per run.
- [ ] Documentation and licensing are complete.
