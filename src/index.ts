import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { showDialog, Dialog, ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const PLUGIN_ID = 'jupyterlab-run-python:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  optional: [ISettingRegistry, ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    palette: ICommandPalette | null
  ) => {
    if (settingRegistry) {
      await settingRegistry.load(PLUGIN_ID);
    }

    app.commands.addCommand('python-runner:run', {
      label: 'Run Python File',
      execute: async () => {
        await showDialog({
          title: 'Run Python File',
          body: 'Command wiring is active. Execution engine is next phase.',
          buttons: [Dialog.okButton({ label: 'OK' })]
        });
      }
    });

    app.commands.addCommand('python-runner:run-advanced', {
      label: 'Run Python File (Advanced)',
      execute: async () => {
        await showDialog({
          title: 'Run Python File (Advanced)',
          body: 'Advanced run dialog scaffold is active. Options are next phase.',
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

    app.commands.notifyCommandChanged();
  }
};

export default plugin;
