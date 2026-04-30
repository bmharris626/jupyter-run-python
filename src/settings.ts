export type DefaultCwdMode = 'script_dir' | 'workspace_root' | 'server_root';

export interface RunnerSettings {
  defaultPythonCommand: string;
  kernelCommandMap: Record<string, string>;
  openNewTerminalPerRun: boolean;
  defaultEnv: Record<string, string>;
  defaultCwdMode: DefaultCwdMode;
  showRunButtonInEditor: boolean;
  recentArgsPresets: Record<string, string[]>;
}

const DEFAULT_SETTINGS: RunnerSettings = {
  defaultPythonCommand: 'python3',
  kernelCommandMap: { python3: 'python3', python: 'python' },
  openNewTerminalPerRun: true,
  defaultEnv: {},
  defaultCwdMode: 'script_dir',
  showRunButtonInEditor: true,
  recentArgsPresets: {}
};

const asStringArrayMap = (value: unknown): Record<string, string[]> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, string[]> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!Array.isArray(entry)) {
      continue;
    }

    const items = entry
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, 5);
    if (items.length > 0) {
      result[key] = items;
    }
  }

  return result;
};

const asStringMap = (value: unknown): Record<string, string> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim();
    if (trimmed.length > 0) {
      result[key] = trimmed;
    }
  }

  return result;
};

export const readRunnerSettings = (composite: Record<string, unknown> | null | undefined): RunnerSettings => {
  const defaultPythonRaw = composite?.defaultPythonCommand;
  const defaultPythonCommand =
    typeof defaultPythonRaw === 'string' && defaultPythonRaw.trim().length > 0
      ? defaultPythonRaw.trim()
      : DEFAULT_SETTINGS.defaultPythonCommand;

  const openNewTerminalPerRunRaw = composite?.openNewTerminalPerRun;
  const openNewTerminalPerRun =
    typeof openNewTerminalPerRunRaw === 'boolean'
      ? openNewTerminalPerRunRaw
      : DEFAULT_SETTINGS.openNewTerminalPerRun;

  const showRunButtonRaw = composite?.showRunButtonInEditor;
  const showRunButtonInEditor =
    typeof showRunButtonRaw === 'boolean' ? showRunButtonRaw : DEFAULT_SETTINGS.showRunButtonInEditor;

  const cwdRaw = composite?.defaultCwdMode;
  const defaultCwdMode: DefaultCwdMode =
    cwdRaw === 'script_dir' || cwdRaw === 'workspace_root' || cwdRaw === 'server_root'
      ? cwdRaw
      : DEFAULT_SETTINGS.defaultCwdMode;

  return {
    defaultPythonCommand,
    kernelCommandMap: asStringMap(composite?.kernelCommandMap),
    openNewTerminalPerRun,
    defaultEnv: asStringMap(composite?.defaultEnv),
    defaultCwdMode,
    showRunButtonInEditor,
    recentArgsPresets: asStringArrayMap(composite?.recentArgsPresets)
  };
};

export const resolveDefaultCwd = (mode: DefaultCwdMode, scriptPath: string): string | null => {
  if (mode === 'server_root') {
    return '/';
  }

  if (mode === 'workspace_root') {
    return null;
  }

  const slashIndex = scriptPath.lastIndexOf('/');
  if (slashIndex <= 0) {
    return null;
  }

  return scriptPath.slice(0, slashIndex);
};
