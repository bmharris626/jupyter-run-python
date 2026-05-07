import { isValidEnvKey } from './env';

export interface RunCommandOptions {
  pythonCommand: string;
  scriptPath: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface RunTemplateOptions {
  template: string | null;
  defaultPythonCommand: string;
  scriptPath: string;
  args?: string[];
  env?: Record<string, string>;
}

export const shellQuote = (value: string): string => {
  if (value.length === 0) {
    return "''";
  }

  return `'${value.replace(/'/g, `'\\''`)}'`;
};

export const buildEnvPrefix = (env: Record<string, string> = {}): string => {
  const parts: string[] = [];

  for (const key of Object.keys(env).sort()) {
    if (!isValidEnvKey(key)) {
      continue;
    }

    parts.push(`${key}=${shellQuote(env[key] ?? '')}`);
  }

  return parts.join(' ');
};

export const buildPythonRunCommand = (options: RunCommandOptions): string => {
  const args = options.args ?? [];
  const envPrefix = buildEnvPrefix(options.env);

  const commandParts = [
    shellQuote(options.pythonCommand),
    shellQuote(options.scriptPath),
    ...args.map(shellQuote)
  ];

  const baseCommand = commandParts.join(' ');
  return envPrefix.length > 0 ? `${envPrefix} ${baseCommand}` : baseCommand;
};

export const buildTransparentExecutionCommand = (runCommand: string): string => {
  const preview = shellQuote(`$ ${runCommand}`);
  return `printf '%s\\n' ${preview}; ${runCommand}`;
};

export const wrapCommandWithCwd = (command: string, cwd: string | null): string => {
  if (!cwd || cwd.trim().length === 0 || !cwd.trim().startsWith('/')) {
    return command;
  }

  return `cd ${shellQuote(cwd.trim())} && ${command}`;
};

export const buildRunCommandFromTemplate = (options: RunTemplateOptions): string => {
  const args = options.args ?? [];
  const normalizedTemplate = options.template?.trim() ?? '';

  if (
    normalizedTemplate.length > 0 &&
    (normalizedTemplate.includes('{script}') || normalizedTemplate.includes('{python}'))
  ) {
    const quotedArgs = args.map(shellQuote).join(' ');
    const replaceToken = (template: string, token: string, value: string): string => {
      return template.split(token).join(value);
    };
    const withPython = replaceToken(
      normalizedTemplate,
      '{python}',
      shellQuote(options.defaultPythonCommand)
    );
    const withScript = replaceToken(withPython, '{script}', shellQuote(options.scriptPath));
    const withArgs = replaceToken(withScript, '{args}', quotedArgs);
    const populated = withArgs.replace(/\s+/g, ' ').trim();

    const envPrefix = buildEnvPrefix(options.env);
    return envPrefix.length > 0 ? `${envPrefix} ${populated}` : populated;
  }

  const pythonCommand = normalizedTemplate.length > 0 ? normalizedTemplate : options.defaultPythonCommand;
  return buildPythonRunCommand({
    pythonCommand,
    scriptPath: options.scriptPath,
    args,
    env: options.env
  });
};
