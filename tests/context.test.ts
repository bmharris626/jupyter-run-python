import { describe, expect, it } from 'vitest';
import { isPythonFile, normalizePath, resolveRunTarget } from '../src/context';

describe('isPythonFile', () => {
  it('returns true for .py paths', () => {
    expect(isPythonFile('script.py')).toBe(true);
    expect(isPythonFile('/tmp/hello.PY')).toBe(true);
  });

  it('returns false for non-python paths', () => {
    expect(isPythonFile('script.sh')).toBe(false);
    expect(isPythonFile('README.md')).toBe(false);
  });

  it('returns false for empty or null input', () => {
    expect(isPythonFile('')).toBe(false);
    expect(isPythonFile('   ')).toBe(false);
    expect(isPythonFile(null)).toBe(false);
    expect(isPythonFile(undefined)).toBe(false);
  });
});

describe('normalizePath', () => {
  it('trims valid paths', () => {
    expect(normalizePath('  a/b/script.py  ')).toBe('a/b/script.py');
  });

  it('returns null for empty values', () => {
    expect(normalizePath('')).toBeNull();
    expect(normalizePath('   ')).toBeNull();
    expect(normalizePath(null)).toBeNull();
    expect(normalizePath(undefined)).toBeNull();
  });
});

describe('resolveRunTarget', () => {
  it('prefers active editor python file', () => {
    expect(
      resolveRunTarget({
        activeEditorPath: 'src/run.py',
        fileBrowserSelectionPath: 'scripts/other.py'
      })
    ).toEqual({ path: 'src/run.py', source: 'editor' });
  });

  it('falls back to file browser python file', () => {
    expect(
      resolveRunTarget({
        activeEditorPath: 'README.md',
        fileBrowserSelectionPath: 'scripts/runner.py'
      })
    ).toEqual({ path: 'scripts/runner.py', source: 'filebrowser' });
  });

  it('returns null target when no python file found', () => {
    expect(
      resolveRunTarget({
        activeEditorPath: 'README.md',
        fileBrowserSelectionPath: 'scripts/runner.sh'
      })
    ).toEqual({ path: null, source: null });
  });
});
