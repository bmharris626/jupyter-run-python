import { describe, expect, it } from 'vitest';
import { hasNonEmptyCommand, isLikelyPythonKernel } from '../src/edge';

describe('isLikelyPythonKernel', () => {
  it('detects python-like kernel names', () => {
    expect(isLikelyPythonKernel('python3')).toBe(true);
    expect(isLikelyPythonKernel('Py311')).toBe(true);
  });

  it('returns false for non-python kernels', () => {
    expect(isLikelyPythonKernel('ir')).toBe(false);
    expect(isLikelyPythonKernel(null)).toBe(false);
  });
});

describe('hasNonEmptyCommand', () => {
  it('checks command content', () => {
    expect(hasNonEmptyCommand('python3 script.py')).toBe(true);
    expect(hasNonEmptyCommand('   ')).toBe(false);
  });
});
