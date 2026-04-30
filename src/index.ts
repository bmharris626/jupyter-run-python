import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, ICommandPalette, ToolbarButton, showDialog } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { resolveRunTarget } from './context';

const PLUGIN_ID = 'jupyterlab-run-python:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  optional: [ISettingRegistry, ICommandPalette, IFileBrowserFactory, IEditorTracker],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    palette: ICommandPalette | null,
    fileBrowserFactory: IFileBrowserFactory | null,
    editorTracker: IEditorTracker | null
  ) => {
    if (settingRegistry) {
      await settingRegistry.load(PLUGIN_ID);
    }

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

    app.commands.addCommand('python-runner:run', {
      label: 'Run Python File',
      isVisible: () => resolveCurrentTarget().path !== null,
      execute: async () => {
        const target = resolveCurrentTarget();
        if (!target.path) {
          await promptNoTarget();
          return;
        }

        await showDialog({
          title: 'Run Python File',
          body: `Target resolved from ${target.source}: ${target.path}`,
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
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

        await showDialog({
          title: 'Run Python File (Advanced)',
          body: `Advanced target resolved from ${target.source}: ${target.path}`,
          buttons: [Dialog.okButton({ label: 'OK' })]
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
