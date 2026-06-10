import { useGuiStore } from '../stores/guiStore.js';

export function useCollapsible() {
  const collapsed = useGuiStore((state) => state.collapsed);
  const setPanelCollapsed = useGuiStore((state) => state.setPanelCollapsed);
  const togglePanel = useGuiStore((state) => state.togglePanel);

  return {
    collapsed,
    setPanelCollapsed,
    togglePanel
  };
}
