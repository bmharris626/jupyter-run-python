// @vitest-environment jsdom

import { beforeAll, describe, expect, it } from 'vitest';

let AdvancedRunForm: typeof import('../src/advanced').AdvancedRunForm;

beforeAll(async () => {
  Object.defineProperty(globalThis, 'DragEvent', {
    value: class DragEvent extends Event {}
  });

  ({ AdvancedRunForm } = await import('../src/advanced'));
});

const createForm = (): AdvancedRunForm => {
  return new AdvancedRunForm({
    targetPath: 'scripts/run.py',
    kernels: ['python3', 'conda-env'],
    selectedKernel: 'conda-env',
    defaultCommand: 'python3',
    defaultEnvText: 'APP_ENV=dev',
    recentArgsPresets: ['--limit 10']
  });
};

describe('AdvancedRunForm', () => {
  it('returns current DOM field values', () => {
    const form = createForm();
    const selects = form.node.querySelectorAll('select');
    const textInputs = form.node.querySelectorAll('input[type="text"]');
    const savePresetCheckbox = form.node.querySelector<HTMLInputElement>(
      '.jp-pythonRunner-savePresetCheckbox'
    );
    const envInput = form.node.querySelector('textarea');

    selects[0].value = 'python3';
    textInputs[0].value = 'python3 -u';
    textInputs[1].value = '--name test';
    textInputs[2].value = '/tmp/project';
    envInput!.value = 'APP_ENV=prod';
    savePresetCheckbox!.checked = true;

    expect(form.getValue()).toEqual({
      kernelName: 'python3',
      commandOverride: 'python3 -u',
      argsText: '--name test',
      envText: 'APP_ENV=prod',
      cwd: '/tmp/project',
      saveArgsPreset: true
    });
  });

  it('copies a selected args preset into the args input', () => {
    const form = createForm();
    const argsPresetSelect = form.node.querySelectorAll('select')[1];

    argsPresetSelect.value = '--limit 10';
    argsPresetSelect.dispatchEvent(new Event('change'));

    expect(form.getValue().argsText).toBe('--limit 10');
  });
});
