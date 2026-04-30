export const isLikelyPythonKernel = (kernelName: string | null): boolean => {
  if (!kernelName) {
    return false;
  }

  return /python|py\d/i.test(kernelName);
};

export const hasNonEmptyCommand = (command: string): boolean => {
  return command.trim().length > 0;
};
