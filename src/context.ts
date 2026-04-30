export function isPythonFile(path: string | null | undefined): boolean {
  if (!path) {
    return false;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return false;
  }

  return trimmed.toLowerCase().endsWith('.py');
}

export function normalizePath(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  const trimmed = path.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveRunTarget(options: {
  activeEditorPath?: string | null;
  fileBrowserSelectionPath?: string | null;
}): { path: string | null; source: 'editor' | 'filebrowser' | null } {
  const editorPath = normalizePath(options.activeEditorPath);
  if (isPythonFile(editorPath)) {
    return { path: editorPath, source: 'editor' };
  }

  const browserPath = normalizePath(options.fileBrowserSelectionPath);
  if (isPythonFile(browserPath)) {
    return { path: browserPath, source: 'filebrowser' };
  }

  return { path: null, source: null };
}
