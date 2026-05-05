import { isValidEnvKey } from './env';

export type DefaultCwdMode = 'script_dir' | 'workspace_root' | 'server_root';

export interface RunnerSettings {
  defaultPythonCommand: string;
  kernelCommandMap: Record<string, string>;
  openNewTerminalPerRun: boolean;
  defaultEnv: Record<string, string>;
  defaultCwdMode: DefaultCwdMode;
  showRunButtonInEditor: boolean;
  recentArgsPresets: Record<string, string[]>;
  serverRootPath: string | null;
}

const DEFAULT_SETTINGS: RunnerSettings = {
  defaultPythonCommand: 'python3',
  kernelCommandMap: { python3: 'python3', python: 'python' },
  openNewTerminalPerRun: true,
  defaultEnv: {},
  defaultCwdMode: 'script_dir',
  showRunButtonInEditor: true,
  recentArgsPresets: {},
  serverRootPath: null
};

const asOptionalAbsolutePath = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || !trimmed.startsWith('/')) {
    return null;
  }

  return trimmed.replace(/\/+$/, '') || '/';
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

const asEnvMap = (value: unknown): Record<string, string> => {
  const result = asStringMap(value);
  for (const key of Object.keys(result)) {
    if (!isValidEnvKey(key)) {
      delete result[key];
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
    defaultEnv: asEnvMap(composite?.defaultEnv),
    defaultCwdMode,
    showRunButtonInEditor,
    recentArgsPresets: asStringArrayMap(composite?.recentArgsPresets),
    serverRootPath: asOptionalAbsolutePath(composite?.serverRootPath)
  };
};

export const resolveAbsoluteScriptPath = (
  serverRootPath: string | null,
  scriptPath: string
): string => {
  if (scriptPath.startsWith('/')) {
    return scriptPath;
  }

  if (!serverRootPath) {
    return scriptPath;
  }

  const normalizedRoot = serverRootPath === '/' ? '' : serverRootPath;
  const normalizedScript = scriptPath.replace(/^\/+/, '');
  return `${normalizedRoot}/${normalizedScript}`;
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
