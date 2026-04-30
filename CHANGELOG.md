# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

### Added
- Core JupyterLab 4 extension scaffold with command palette integration.
- `.py` context resolution for editor and file browser selection.
- Editor toolbar buttons and file browser context menu actions.
- Terminal-backed script execution with command preview output.
- Kernel-aware `Run` behavior with settings-based fallback mappings.
- `Run Advanced` dialog with kernel, command override, args, env, and cwd inputs.
- Settings loading with reactive updates for subsequent executions.
- Edge-case handling for missing files, terminal failures, and non-Python kernels.
- Unit tests for context, kernel mapping, execution, advanced parsing, settings, and edge logic.
