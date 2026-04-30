import { Widget } from '@lumino/widgets';
import { AdvancedRunValues } from './advanced-utils';

export class AdvancedRunForm extends Widget {
  private readonly kernelSelect: HTMLSelectElement;
  private readonly commandInput: HTMLInputElement;
  private readonly argsInput: HTMLInputElement;
  private readonly envInput: HTMLTextAreaElement;
  private readonly cwdInput: HTMLInputElement;

  constructor(options: {
    targetPath: string;
    kernels: string[];
    selectedKernel: string;
    defaultCommand: string;
    defaultEnvText: string;
  }) {
    super({ node: document.createElement('div') });
    this.addClass('jp-pythonRunner-advancedForm');

    const createLabel = (text: string): HTMLLabelElement => {
      const label = document.createElement('label');
      label.textContent = text;
      label.style.display = 'block';
      label.style.marginTop = '8px';
      return label;
    };

    const targetLabel = document.createElement('div');
    targetLabel.textContent = `Script: ${options.targetPath}`;
    targetLabel.style.marginBottom = '8px';
    this.node.appendChild(targetLabel);

    this.node.appendChild(createLabel('Kernel'));
    this.kernelSelect = document.createElement('select');
    this.kernelSelect.style.width = '100%';
    for (const kernel of options.kernels) {
      const option = document.createElement('option');
      option.value = kernel;
      option.text = kernel;
      this.kernelSelect.appendChild(option);
    }
    this.kernelSelect.value = options.selectedKernel;
    this.node.appendChild(this.kernelSelect);

    this.node.appendChild(createLabel('Interpreter/command override'));
    this.commandInput = document.createElement('input');
    this.commandInput.type = 'text';
    this.commandInput.placeholder = options.defaultCommand;
    this.commandInput.style.width = '100%';
    this.node.appendChild(this.commandInput);

    this.node.appendChild(createLabel('Arguments'));
    this.argsInput = document.createElement('input');
    this.argsInput.type = 'text';
    this.argsInput.placeholder = '--flag value';
    this.argsInput.style.width = '100%';
    this.node.appendChild(this.argsInput);

    this.node.appendChild(createLabel('Environment (KEY=value per line)'));
    this.envInput = document.createElement('textarea');
    this.envInput.rows = 5;
    this.envInput.style.width = '100%';
    this.envInput.value = options.defaultEnvText;
    this.node.appendChild(this.envInput);

    this.node.appendChild(createLabel('Working directory'));
    this.cwdInput = document.createElement('input');
    this.cwdInput.type = 'text';
    this.cwdInput.placeholder = 'Leave empty to use server default';
    this.cwdInput.style.width = '100%';
    this.node.appendChild(this.cwdInput);
  }

  getValue(): AdvancedRunValues {
    return {
      kernelName: this.kernelSelect.value,
      commandOverride: this.commandInput.value,
      argsText: this.argsInput.value,
      envText: this.envInput.value,
      cwd: this.cwdInput.value
    };
  }
}
