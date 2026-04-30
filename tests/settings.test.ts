import { describe, expect, it } from 'vitest';
import { readRunnerSettings, resolveDefaultCwd } from '../src/settings';

describe('readRunnerSettings', () => {
  it('loads valid settings values', () => {
    const settings = readRunnerSettings({
      defaultPythonCommand: 'python3.12',
      kernelCommandMap: { python3: '{python} -u {script} {args}' },
      openNewTerminalPerRun: false,
      defaultEnv: { APP_ENV: 'dev' },
      defaultCwdMode: 'server_root',
      showRunButtonInEditor: false,
      recentArgsPresets: { 'a.py': ['--foo 1', '--bar 2'] }
    });

    expect(settings.defaultPythonCommand).toBe('python3.12');
    expect(settings.kernelCommandMap.python3).toBe('{python} -u {script} {args}');
    expect(settings.openNewTerminalPerRun).toBe(false);
    expect(settings.defaultEnv.APP_ENV).toBe('dev');
    expect(settings.defaultCwdMode).toBe('server_root');
    expect(settings.showRunButtonInEditor).toBe(false);
    expect(settings.recentArgsPresets['a.py']).toEqual(['--foo 1', '--bar 2']);
  });

  it('falls back for invalid inputs', () => {
    const settings = readRunnerSettings({
      defaultPythonCommand: '   ',
      kernelCommandMap: { python3: 7 },
      defaultEnv: { A: 1 },
      defaultCwdMode: 'bad',
      recentArgsPresets: { 'b.py': [1, '   ', '--ok'], 'x.py': 'nope' }
    });

    expect(settings.defaultPythonCommand).toBe('python3');
    expect(settings.kernelCommandMap).toEqual({});
    expect(settings.defaultEnv).toEqual({});
    expect(settings.defaultCwdMode).toBe('script_dir');
    expect(settings.openNewTerminalPerRun).toBe(true);
    expect(settings.showRunButtonInEditor).toBe(true);
    expect(settings.recentArgsPresets['b.py']).toEqual(['--ok']);
  });
});

describe('resolveDefaultCwd', () => {
  it('resolves script_dir and server_root modes', () => {
    expect(resolveDefaultCwd('script_dir', 'a/b/run.py')).toBe('a/b');
    expect(resolveDefaultCwd('server_root', 'a/b/run.py')).toBe('/');
  });

  it('returns null when workspace_root or no directory is available', () => {
    expect(resolveDefaultCwd('workspace_root', 'a/b/run.py')).toBeNull();
    expect(resolveDefaultCwd('script_dir', 'run.py')).toBeNull();
  });
});
