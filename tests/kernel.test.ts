import { describe, expect, it } from 'vitest';
import { getActiveKernelName, resolveKernelCommandTemplate } from '../src/kernel';

describe('getActiveKernelName', () => {
  it('reads runtime kernel name from session context', () => {
    const widget = {
      sessionContext: {
        session: {
          kernel: {
            name: 'python3'
          }
        }
      }
    };

    expect(getActiveKernelName(widget)).toBe('python3');
  });

  it('falls back to preferred kernel name', () => {
    const widget = {
      sessionContext: {
        session: {
          kernel: null
        },
        kernelPreference: {
          name: 'python'
        }
      }
    };

    expect(getActiveKernelName(widget)).toBe('python');
  });

  it('returns null when no kernel context exists', () => {
    expect(getActiveKernelName({})).toBeNull();
    expect(getActiveKernelName(null)).toBeNull();
  });
});

describe('resolveKernelCommandTemplate', () => {
  it('matches exact kernel name first', () => {
    expect(resolveKernelCommandTemplate('Python3', { Python3: 'python3.12' })).toBe('python3.12');
  });

  it('matches lowercased key as fallback', () => {
    expect(resolveKernelCommandTemplate('Python3', { python3: 'python3' })).toBe('python3');
  });

  it('returns null when mapping is unavailable', () => {
    expect(resolveKernelCommandTemplate('python3', { pypy: 'pypy3' })).toBeNull();
  });
});
