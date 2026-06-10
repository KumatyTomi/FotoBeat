import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const GUI_STORE_KEY = 'fotobeat.gui.v3.store';
export const LEGACY_GUI_CONFIG_KEY = 'fotobeat.gui.v3.config';
export const DEFAULT_PROFILE = 'creator';

export const DEFAULT_COLLAPSED = {
  leftRail: true,
  rightDrawer: true,
  bottomQueue: true
};

const KNOWN_PROFILES = ['simple', 'creator', 'editor', 'debug'];
const legacyConfig = readLegacyGuiConfig();

export const useGuiStore = create(
  persist(
    (set) => ({
      activeProfile: sanitizeProfileId(legacyConfig.activeProfile) ?? DEFAULT_PROFILE,
      collapsed: {
        ...DEFAULT_COLLAPSED,
        ...sanitizeCollapsed(legacyConfig.collapsed)
      },
      setActiveProfile: (profileId) => {
        const nextProfile = sanitizeProfileId(profileId);
        if (!nextProfile) return;
        set({ activeProfile: nextProfile });
      },
      setPanelCollapsed: (panel, value) => {
        if (!Object.hasOwn(DEFAULT_COLLAPSED, panel)) return;
        set((state) => ({
          collapsed: {
            ...state.collapsed,
            [panel]: Boolean(value)
          }
        }));
      },
      togglePanel: (panel) => {
        if (!Object.hasOwn(DEFAULT_COLLAPSED, panel)) return;
        set((state) => ({
          collapsed: {
            ...state.collapsed,
            [panel]: !state.collapsed[panel]
          }
        }));
      },
      resetGuiLayout: () => set({
        activeProfile: DEFAULT_PROFILE,
        collapsed: DEFAULT_COLLAPSED
      })
    }),
    {
      name: GUI_STORE_KEY,
      storage: createJSONStorage(() => getBrowserStorage()),
      partialize: (state) => ({
        activeProfile: state.activeProfile,
        collapsed: state.collapsed
      }),
      version: 1
    }
  )
);

function getBrowserStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createMemoryStorage();
  }

  return window.localStorage;
}

function createMemoryStorage() {
  const memory = new Map();

  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key)
  };
}

function sanitizeProfileId(profileId) {
  return KNOWN_PROFILES.includes(profileId) ? profileId : null;
}

function sanitizeCollapsed(candidate) {
  if (!candidate || typeof candidate !== 'object') return {};

  return Object.keys(DEFAULT_COLLAPSED).reduce((result, key) => {
    if (Object.hasOwn(candidate, key)) {
      result[key] = Boolean(candidate[key]);
    }
    return result;
  }, {});
}

function readLegacyGuiConfig() {
  if (typeof window === 'undefined') return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEGACY_GUI_CONFIG_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
