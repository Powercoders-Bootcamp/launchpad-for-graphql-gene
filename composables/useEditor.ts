export type PanelId = 'input' | 'sdl-output' | 'result-output' | 'sql-output'

const PANEL_CONFIG: Record<PanelId, { language: string; readOnly: boolean }> = {
  'input':         { language: 'graphql', readOnly: false },
  'sdl-output':    { language: 'graphql', readOnly: true },
  'result-output': { language: 'json',    readOnly: true },
  'sql-output':    { language: 'sql',     readOnly: true },
}

const SHARED_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  fontFamily: '"IBM Plex Mono", Consolas, monospace',
  wordWrap: 'on' as const,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
}

export function useEditor() {
  function getOptions(panelId: PanelId) {
    const { language, readOnly } = PANEL_CONFIG[panelId]
    return {
      ...SHARED_OPTIONS,
      language,
      readOnly,
      lineNumbers: (readOnly ? 'off' : 'on') as 'off' | 'on',
      renderLineHighlight: (readOnly ? 'none' : 'line') as 'none' | 'line',
    }
  }

  function getTheme(isDark: boolean) {
    return isDark ? 'vs-dark' : 'vs'
  }

  return { getOptions, getTheme }
}
