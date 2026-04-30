export interface AdvancedRunValues {
  kernelName: string;
  commandOverride: string;
  argsText: string;
  envText: string;
  cwd: string;
  saveArgsPreset: boolean;
}

export interface AdvancedRunResolved {
  kernelName: string | null;
  commandOverride: string | null;
  args: string[];
  env: Record<string, string>;
  cwd: string | null;
  saveArgsPreset: boolean;
}

export const parseArgs = (value: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let quote: 'single' | 'double' | null = null;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (quote === null && /\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    if (ch === "'" && quote !== 'double') {
      quote = quote === 'single' ? null : 'single';
      continue;
    }

    if (ch === '"' && quote !== 'single') {
      quote = quote === 'double' ? null : 'double';
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
};

export const parseEnvText = (value: string): { env: Record<string, string>; invalidKeys: string[] } => {
  const env: Record<string, string> = {};
  const invalidKeys: string[] = [];

  const lines = value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  for (const line of lines) {
    const equals = line.indexOf('=');
    if (equals <= 0) {
      invalidKeys.push(line);
      continue;
    }

    const key = line.slice(0, equals).trim();
    const val = line.slice(equals + 1);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      invalidKeys.push(key);
      continue;
    }

    env[key] = val;
  }

  return { env, invalidKeys };
};

export const resolveAdvancedValues = (values: AdvancedRunValues): AdvancedRunResolved => {
  const parsedEnv = parseEnvText(values.envText);
  if (parsedEnv.invalidKeys.length > 0) {
    throw new Error(`Invalid environment variable keys: ${parsedEnv.invalidKeys.join(', ')}`);
  }

  return {
    kernelName: values.kernelName.trim().length > 0 ? values.kernelName.trim() : null,
    commandOverride: values.commandOverride.trim().length > 0 ? values.commandOverride.trim() : null,
    args: parseArgs(values.argsText),
    env: parsedEnv.env,
    cwd: values.cwd.trim().length > 0 ? values.cwd.trim() : null,
    saveArgsPreset: values.saveArgsPreset
  };
};
