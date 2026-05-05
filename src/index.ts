import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, ICommandPalette, ToolbarButton, showDialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITerminalTracker } from '@jupyterlab/terminal';
import { AdvancedRunForm } from './advanced';
import { formatEnvText, resolveAdvancedValues } from './advanced-utils';
import { resolveRunTarget } from './context';
import { hasNonEmptyCommand, isLikelyPythonKernel } from './edge';
import {
  buildRunCommandFromTemplate,
  buildTransparentExecutionCommand,
  wrapCommandWithCwd
} from './execution';
import { getActiveKernelName, resolveKernelAbsolutePython, resolveKernelCommandTemplate } from './kernel';
import {
  readRunnerSettings,
  resolveAbsoluteScriptPath,
  resolveDefaultCwd,
  RunnerSettings
} from './settings';

const PLUGIN_ID = 'jupyterlab-run-python:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  optional: [
    ISettingRegistry,
    ICommandPalette,
    IFileBrowserFactory,
    IEditorTracker,
    ITerminalTracker
  ],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    palette: ICommandPalette | null,
    fileBrowserFactory: IFileBrowserFactory | null,
    editorTracker: IEditorTracker | null,
    terminalTracker: ITerminalTracker | null
  ) => {
    const loadedSettings = settingRegistry ? await settingRegistry.load(PLUGIN_ID) : null;
    let runnerSettings: RunnerSettings = readRunnerSettings(
      (loadedSettings?.composite as Record<string, unknown> | undefined) ?? null
    );

    loadedSettings?.changed.connect(() => {
      runnerSettings = readRunnerSettings(loadedSettings.composite as Record<string, unknown>);
      app.commands.notifyCommandChanged();
    });

    const getEditorPath = (): string | null => {
      const current = editorTracker?.currentWidget;
      return current?.context.path ?? null;
    };

    const getFileBrowserPath = (): string | null => {
      const browser = fileBrowserFactory?.tracker.currentWidget;
      if (!browser) {
        return null;
      }

      const selected = [...browser.selectedItems()];
      if (selected.length !== 1) {
        return null;
      }

      const item = selected[0];
      return item.type === 'file' ? item.path : null;
    };

    const promptNoTarget = async (): Promise<void> => {
      await showDialog({
        title: 'No Python file selected',
        body: 'Select a .py file in the file browser or open a .py file in the editor.',
        buttons: [Dialog.okButton({ label: 'OK' })]
      });
    };

    const resolveCurrentTarget = (): { path: string | null; source: 'editor' | 'filebrowser' | null } => {
      return resolveRunTarget({
        activeEditorPath: getEditorPath(),
        fileBrowserSelectionPath: getFileBrowserPath()
      });
    };

    let latestRunCommand: string | null = null;
    let latestRunTerminalId: string | null = null;
    let preferredReusableTerminalId: string | null = null;

    const updateRecentArgsPresets = async (scriptPath: string, argsText: string): Promise<void> => {
      if (!loadedSettings || argsText.trim().length === 0) {
        return;
      }

      const current = { ...runnerSettings.recentArgsPresets };
      const existing = current[scriptPath] ?? [];
      const next = [argsText.trim(), ...existing.filter(item => item !== argsText.trim())].slice(0, 5);
      current[scriptPath] = next;
      await loadedSettings.set('recentArgsPresets', current);
    };

    const getTrackedTerminalWidget = () => {
      if (!terminalTracker) {
        return null;
      }

      let matched: ITerminalTracker['currentWidget'] = null;
      terminalTracker.forEach(widget => {
        if (widget.id === preferredReusableTerminalId) {
          matched = widget;
        }
      });

      return matched;
    };

    const runInTerminal = async (command: string): Promise<boolean> => {
      if (!terminalTracker || !app.serviceManager.terminals.isAvailable()) {
        await showDialog({
          title: 'Terminal unavailable',
          body: 'Jupyter server terminals are disabled or the terminal extension is not loaded.',
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
        return false;
      }

      try {
        const reusableTerminal = getTrackedTerminalWidget();
        const shouldCreateNew =
          runnerSettings.openNewTerminalPerRun || (!reusableTerminal && !terminalTracker.currentWidget);
        if (shouldCreateNew) {
          await app.commands.execute('terminal:create-new');
          preferredReusableTerminalId = terminalTracker.currentWidget?.id ?? null;
        }

        const terminalWidget = reusableTerminal ?? terminalTracker.currentWidget;
        if (!terminalWidget) {
          await showDialog({
            title: 'Terminal launch failed',
            body: 'Could not open a terminal session.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return false;
        }

        await app.shell.activateById(terminalWidget.id);
        terminalWidget.content.session.send({
          type: 'stdin',
          content: [buildTransparentExecutionCommand(command) + '\n']
        });
        latestRunCommand = command;
        latestRunTerminalId = terminalWidget.id;
        if (!runnerSettings.openNewTerminalPerRun) {
          preferredReusableTerminalId = terminalWidget.id;
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown terminal error.';
        await showDialog({
          title: 'Terminal execution failed',
          body: `Could not start script execution: ${message}`,
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
        return false;
      }
    };

    const ensureScriptExists = async (path: string): Promise<boolean> => {
      try {
        const model = await app.serviceManager.contents.get(path, { content: false });
        if (model.type !== 'file') {
          await showDialog({
            title: 'Invalid script target',
            body: `Target is not a file: ${path}`,
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return false;
        }

        return true;
      } catch (_error) {
        await showDialog({
          title: 'Script not found',
          body: `The selected script cannot be found on disk: ${path}`,
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
        return false;
      }
    };

    app.commands.addCommand('python-runner:run', {
      label: 'Run Python File',
      isVisible: () => resolveCurrentTarget().path !== null,
      execute: async () => {
        const target = resolveCurrentTarget();
        if (!target.path) {
          await promptNoTarget();
          return;
        }
        if (!(await ensureScriptExists(target.path))) {
          return;
        }

        const kernelName = getActiveKernelName(app.shell.currentWidget);
        const kernelspecs = app.serviceManager.kernelspecs.specs?.kernelspecs ?? {};
        const template = resolveKernelCommandTemplate(kernelName, runnerSettings.kernelCommandMap);
        const kernelAbsolutePython = resolveKernelAbsolutePython(kernelName, kernelspecs);
        const scriptPath = resolveAbsoluteScriptPath(runnerSettings.serverRootPath, target.path);
        const runCommand = buildRunCommandFromTemplate({
          template,
          defaultPythonCommand: kernelAbsolutePython ?? runnerSettings.defaultPythonCommand,
          scriptPath
        });
        if (!hasNonEmptyCommand(runCommand)) {
          await showDialog({
            title: 'Invalid run command',
            body: 'Resolved run command is empty. Check extension settings.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return;
        }
        const cwd = resolveDefaultCwd(runnerSettings.defaultCwdMode, target.path);
        await runInTerminal(wrapCommandWithCwd(runCommand, cwd));
      }
    });

    app.commands.addCommand('python-runner:run-advanced', {
      label: 'Run Python File (Advanced)',
      isVisible: () => resolveCurrentTarget().path !== null,
      execute: async () => {
        const target = resolveCurrentTarget();
        if (!target.path) {
          await promptNoTarget();
          return;
        }
        if (!(await ensureScriptExists(target.path))) {
          return;
        }

        const defaultPythonCommand = runnerSettings.defaultPythonCommand;
        const kernelCommandMap = runnerSettings.kernelCommandMap;
        const defaultEnv = runnerSettings.defaultEnv;
        const activeKernelName = getActiveKernelName(app.shell.currentWidget);
        const kernelspecs = app.serviceManager.kernelspecs.specs?.kernelspecs ?? {};
        const kernelOptions = Object.keys(kernelspecs);
        const selectedKernel =
          (activeKernelName && kernelOptions.includes(activeKernelName)
            ? activeKernelName
            : kernelOptions[0]) ?? '';

        const form = new AdvancedRunForm({
          targetPath: target.path,
          kernels: kernelOptions,
          selectedKernel,
          defaultCommand: defaultPythonCommand,
          defaultEnvText: formatEnvText(defaultEnv),
          recentArgsPresets: runnerSettings.recentArgsPresets[target.path] ?? []
        });

        const result = await showDialog({
          title: 'Run Python File (Advanced)',
          body: form,
          buttons: [Dialog.cancelButton({ label: 'Cancel' }), Dialog.okButton({ label: 'Run' })]
        });

        if (!result.button.accept) {
          return;
        }

        if (!result.value) {
          await showDialog({
            title: 'Invalid advanced options',
            body: 'Could not read advanced run options from dialog.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return;
        }

        let resolved;
        try {
          resolved = resolveAdvancedValues(result.value);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid advanced run input.';
          await showDialog({
            title: 'Invalid advanced options',
            body: message,
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return;
        }

        const mergedEnv = { ...defaultEnv, ...resolved.env };
        const templateFromKernel = resolveKernelCommandTemplate(resolved.kernelName, kernelCommandMap);
        const kernelAbsolutePython = resolveKernelAbsolutePython(resolved.kernelName, kernelspecs);
        const scriptPath = resolveAbsoluteScriptPath(runnerSettings.serverRootPath, target.path);
        if (!resolved.commandOverride && resolved.kernelName && !isLikelyPythonKernel(resolved.kernelName)) {
          const proceed = await showDialog({
            title: 'Non-Python kernel selected',
            body: `Kernel "${resolved.kernelName}" does not look like a Python kernel. Continue with ${defaultPythonCommand}?`,
            buttons: [Dialog.cancelButton({ label: 'Cancel' }), Dialog.okButton({ label: 'Continue' })]
          });
          if (!proceed.button.accept) {
            return;
          }
        }

        const runCommand = buildRunCommandFromTemplate({
          template: resolved.commandOverride ?? templateFromKernel,
          defaultPythonCommand: kernelAbsolutePython ?? defaultPythonCommand,
          scriptPath,
          args: resolved.args,
          env: mergedEnv
        });
        if (!hasNonEmptyCommand(runCommand)) {
          await showDialog({
            title: 'Invalid advanced command',
            body: 'Resolved advanced command is empty. Set a command override or update kernel mapping.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return;
        }
        const fallbackCwd = resolveDefaultCwd(runnerSettings.defaultCwdMode, target.path);
        const finalCommand = wrapCommandWithCwd(runCommand, resolved.cwd ?? fallbackCwd);
        const didRun = await runInTerminal(finalCommand);
        if (didRun && resolved.saveArgsPreset && result.value.argsText.trim().length > 0) {
          await updateRecentArgsPresets(target.path, result.value.argsText);
        }
      }
    });

    app.commands.addCommand('python-runner:rerun-latest', {
      label: 'Re-run Last Python Command',
      isEnabled: () => latestRunCommand !== null,
      execute: async () => {
        if (!latestRunCommand) {
          return;
        }

        await runInTerminal(latestRunCommand);
      }
    });

    app.commands.addCommand('python-runner:stop-latest', {
      label: 'Stop Last Python Run',
      isEnabled: () => latestRunTerminalId !== null,
      execute: async () => {
        if (!terminalTracker || !latestRunTerminalId) {
          return;
        }

        await app.shell.activateById(latestRunTerminalId);
        const latestTerminal = terminalTracker.currentWidget;

        if (!latestTerminal || latestTerminal.id !== latestRunTerminalId) {
          await showDialog({
            title: 'Latest terminal missing',
            body: 'No active terminal was found for the latest run.',
            buttons: [Dialog.okButton({ label: 'OK' })]
          });
          return;
        }

        latestTerminal.content.session.send({
          type: 'stdin',
          content: ['\u0003']
        });
      }
    });

    app.commands.addCommand('python-runner:about', {
      label: 'Python Runner: About',
      execute: async () => {
        await showDialog({
          title: 'Python Runner',
          body: 'JupyterLab 4 extension scaffold loaded successfully.',
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
      }
    });

    if (palette) {
      palette.addItem({ command: 'python-runner:run', category: 'Python Runner' });
      palette.addItem({
        command: 'python-runner:run-advanced',
        category: 'Python Runner'
      });
      palette.addItem({ command: 'python-runner:rerun-latest', category: 'Python Runner' });
      palette.addItem({ command: 'python-runner:stop-latest', category: 'Python Runner' });
      palette.addItem({ command: 'python-runner:about', category: 'Python Runner' });
    }

    if (fileBrowserFactory) {
      app.contextMenu.addItem({
        command: 'python-runner:run',
        selector: '.jp-DirListing-item[data-isdir="false"]',
        rank: 5
      });
      app.contextMenu.addItem({
        command: 'python-runner:run-advanced',
        selector: '.jp-DirListing-item[data-isdir="false"]',
        rank: 6
      });
    }

    if (editorTracker) {
      editorTracker.widgetAdded.connect((_sender, widget) => {
        if (!runnerSettings.showRunButtonInEditor) {
          return;
        }

        const path = widget.context.path;
        if (!path.toLowerCase().endsWith('.py')) {
          return;
        }

        widget.toolbar.insertItem(
          10,
          'python-runner-run',
          new ToolbarButton({
            label: 'Run',
            onClick: () => {
              void app.commands.execute('python-runner:run');
            }
          })
        );

        widget.toolbar.insertItem(
          11,
          'python-runner-run-advanced',
          new ToolbarButton({
            label: 'Run Advanced',
            onClick: () => {
              void app.commands.execute('python-runner:run-advanced');
            }
          })
        );
      });
    }

    app.commands.notifyCommandChanged();
  }
};

export default plugin;
