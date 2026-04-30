import { describe, expect, it } from 'vitest';
import {
  getActiveKernelName,
  resolveKernelAbsolutePython,
  resolveKernelCommandTemplate
} from '../src/kernel';

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

describe('resolveKernelAbsolutePython', () => {
  it('returns absolute interpreter from kernelspec argv', () => {
    expect(
      resolveKernelAbsolutePython('python3', {
        python3: { argv: ['/opt/conda/bin/python', '-m', 'ipykernel_launcher', '-f', '{connection_file}'] }
      })
    ).toBe('/opt/conda/bin/python');
  });

  it('returns null for missing or non-absolute interpreter', () => {
    expect(resolveKernelAbsolutePython('python3', {})).toBeNull();
    expect(resolveKernelAbsolutePython('python3', { python3: { argv: ['python3'] } })).toBeNull();
  });
});
