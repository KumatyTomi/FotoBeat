import { useCallback, useState } from 'react';

const CONFIG_KEY = 'fotobeat.gui.v3.config';
const DEFAULT_COLLAPSED = {
  leftRail: true,
  rightDrawer: true,
  bottomQueue: true
};

export function useCollapsible() {
  const [collapsed, setCollapsed] = useState(() => ({
    ...DEFAULT_COLLAPSED,
    ...(readConfig().collapsed ?? {})
  }));

  const setPanelCollapsed = useCallback((panel, value) => {
    setCollapsed((current) => {
      const next = { ...current, [panel]: Boolean(value) };
      writeConfig({ collapsed: next });
      return next;
    });
  }, []);

  const togglePanel = useCallback((panel) => {
    setCollapsed((current) => {
      const next = { ...current, [panel]: !current[panel] };
      writeConfig({ collapsed: next });
      return next;
    });
  }, []);

  return {
    collapsed,
    setPanelCollapsed,
    togglePanel
  };
}

function readConfig() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(CONFIG_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeConfig(partial) {
  if (typeof window === 'undefined') return;
  const current = readConfig();
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...partial }, null, 2));
}
