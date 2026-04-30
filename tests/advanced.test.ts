import { describe, expect, it } from 'vitest';
import { parseArgs, parseEnvText, resolveAdvancedValues } from '../src/advanced-utils';

describe('parseArgs', () => {
  it('splits plain whitespace arguments', () => {
    expect(parseArgs('--foo bar baz')).toEqual(['--foo', 'bar', 'baz']);
  });

  it('supports quoted segments', () => {
    expect(parseArgs("--name 'Jane Doe' --title \"Data Scientist\"")).toEqual([
      '--name',
      'Jane Doe',
      '--title',
      'Data Scientist'
    ]);
  });
});

describe('parseEnvText', () => {
  it('parses valid key value lines', () => {
    expect(parseEnvText('A=1\nB=two')).toEqual({
      env: { A: '1', B: 'two' },
      invalidKeys: []
    });
  });

  it('reports invalid keys and malformed lines', () => {
    expect(parseEnvText('bad-key=x\nNOVAL')).toEqual({
      env: {},
      invalidKeys: ['bad-key', 'NOVAL']
    });
  });
});

describe('resolveAdvancedValues', () => {
  it('normalizes advanced values payload', () => {
    expect(
      resolveAdvancedValues({
        kernelName: ' python3 ',
        commandOverride: ' python3 -u ',
        argsText: "--x 'hello world'",
        envText: 'APP_ENV=dev',
        cwd: ' /tmp/project ',
        saveArgsPreset: true
      })
    ).toEqual({
      kernelName: 'python3',
      commandOverride: 'python3 -u',
      args: ['--x', 'hello world'],
      env: { APP_ENV: 'dev' },
      cwd: '/tmp/project',
      saveArgsPreset: true
    });
  });

  it('throws on invalid env key', () => {
    expect(() =>
      resolveAdvancedValues({
        kernelName: '',
        commandOverride: '',
        argsText: '',
        envText: 'bad-key=value',
        cwd: '',
        saveArgsPreset: false
      })
    ).toThrow(/Invalid environment variable keys/);
  });
});
