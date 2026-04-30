export interface KernelCommandSettings {
  defaultPythonCommand: string;
  kernelCommandMap: Record<string, string>;
}

interface KernelSpecLike {
  argv?: string[];
}

interface KernelLike {
  name?: string | null;
}

interface SessionLike {
  kernel?: KernelLike | null;
}

interface KernelPreferenceLike {
  name?: string | null;
}

interface SessionContextLike {
  session?: SessionLike | null;
  kernelPreference?: KernelPreferenceLike | null;
}

interface WidgetWithSessionContext {
  sessionContext?: SessionContextLike | null;
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
};

const readSessionContext = (widget: unknown): SessionContextLike | null => {
  const widgetRecord = asRecord(widget);
  if (!widgetRecord) {
    return null;
  }

  const maybeWidget = widgetRecord as WidgetWithSessionContext;
  return maybeWidget.sessionContext ?? null;
};

export const getActiveKernelName = (widget: unknown): string | null => {
  const sessionContext = readSessionContext(widget);
  if (!sessionContext) {
    return null;
  }

  const runtimeKernelName = sessionContext.session?.kernel?.name?.trim() ?? '';
  if (runtimeKernelName.length > 0) {
    return runtimeKernelName;
  }

  const preferredKernelName = sessionContext.kernelPreference?.name?.trim() ?? '';
  return preferredKernelName.length > 0 ? preferredKernelName : null;
};

export const resolveKernelCommandTemplate = (
  kernelName: string | null,
  kernelCommandMap: Record<string, string>
): string | null => {
  if (!kernelName) {
    return null;
  }

  const direct = kernelCommandMap[kernelName];
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  const lowered = kernelCommandMap[kernelName.toLowerCase()];
  if (typeof lowered === 'string' && lowered.trim().length > 0) {
    return lowered.trim();
  }

  return null;
};

export const resolveKernelAbsolutePython = (
  kernelName: string | null,
  kernelspecs: Record<string, KernelSpecLike | undefined>
): string | null => {
  if (!kernelName) {
    return null;
  }

  const spec = kernelspecs[kernelName] ?? kernelspecs[kernelName.toLowerCase()];
  const interpreter = spec?.argv?.[0]?.trim() ?? '';
  if (!interpreter.startsWith('/')) {
    return null;
  }

  return interpreter;
};
