import { describe, expect, it } from 'vitest';
import {
  buildEnvPrefix,
  buildPythonRunCommand,
  buildRunCommandFromTemplate,
  buildTransparentExecutionCommand,
  shellQuote,
  wrapCommandWithCwd
} from '../src/execution';

describe('shellQuote', () => {
  it('quotes plain strings', () => {
    expect(shellQuote('python3')).toBe("'python3'");
  });

  it('escapes single quotes', () => {
    expect(shellQuote("a'b")).toBe("'a'\\''b'");
  });
});

describe('buildEnvPrefix', () => {
  it('builds safe env assignments and ignores invalid keys', () => {
    expect(
      buildEnvPrefix({
        PYTHONPATH: '/tmp/path',
        'bad-key': 'x',
        APP_ENV: 'dev'
      })
    ).toBe("APP_ENV='dev' PYTHONPATH='/tmp/path'");
  });
});

describe('buildPythonRunCommand', () => {
  it('quotes interpreter, path, and args', () => {
    expect(
      buildPythonRunCommand({
        pythonCommand: 'python3',
        scriptPath: 'folder with spaces/test.py',
        args: ['--name', "O'Brien"]
      })
    ).toBe("'python3' 'folder with spaces/test.py' '--name' 'O'\\''Brien'");
  });

  it('prefixes environment variables', () => {
    expect(
      buildPythonRunCommand({
        pythonCommand: 'python3',
        scriptPath: 'test.py',
        env: { APP_ENV: 'prod' }
      })
    ).toBe("APP_ENV='prod' 'python3' 'test.py'");
  });
});

describe('buildTransparentExecutionCommand', () => {
  it('prints expanded command before execution', () => {
    const wrapped = buildTransparentExecutionCommand("'python3' 'test.py'");
    expect(wrapped).toContain("printf '%s\\n'");
    expect(wrapped).toContain("'python3' 'test.py'");
  });
});

describe('buildRunCommandFromTemplate', () => {
  it('uses fallback python command when no template is provided', () => {
    expect(
      buildRunCommandFromTemplate({
        template: null,
        defaultPythonCommand: 'python3',
        scriptPath: 'script.py'
      })
    ).toBe("'python3' 'script.py'");
  });

  it('applies tokenized template when script token exists', () => {
    expect(
      buildRunCommandFromTemplate({
        template: "{python} -u {script} {args}",
        defaultPythonCommand: 'python3',
        scriptPath: 'dir/test.py',
        args: ['--foo', 'bar']
      })
    ).toBe("'python3' -u 'dir/test.py' '--foo' 'bar'");
  });
});

describe('wrapCommandWithCwd', () => {
  it('returns command unchanged when cwd absent', () => {
    expect(wrapCommandWithCwd("'python3' 'script.py'", null)).toBe("'python3' 'script.py'");
  });

  it('prefixes command with safe cwd change', () => {
    expect(wrapCommandWithCwd("'python3' 'script.py'", '/tmp/path with space')).toBe(
      "cd '/tmp/path with space' && 'python3' 'script.py'"
    );
  });
});
