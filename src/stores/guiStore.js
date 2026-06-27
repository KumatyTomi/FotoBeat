// @ts-nocheck
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

export const DEFAULT_VEIL_LAYER = {
  enabled: true,
  sourceUrl: '',
  sourceType: 'video',
  opacity: 0.32,
  blur: 16,
  saturation: 1.18,
  speed: 1,
  reactivity: 0.58,
  sphereSync: true,
  flowMode: true
};

const KNOWN_PROFILES = ['simple', 'creator', 'editor', 'debug'];
const KNOWN_SOURCE_TYPES = ['video', 'image'];
const legacyConfig = readLegacyGuiConfig();

export const useGuiStore = create(
  persist(
    (set) => ({
      activeProfile: sanitizeProfileId(legacyConfig.activeProfile) ?? DEFAULT_PROFILE,
      collapsed: {
        ...DEFAULT_COLLAPSED,
        ...sanitizeCollapsed(legacyConfig.collapsed)
      },
      veilLayer: {
        ...DEFAULT_VEIL_LAYER,
        ...sanitizeVeilLayer(legacyConfig.veilLayer)
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
      setVeilLayer: (patch) => {
        set((state) => ({
          veilLayer: {
            ...state.veilLayer,
            ...sanitizeVeilLayer(patch)
          }
        }));
      },
      resetVeilLayer: () => set({ veilLayer: DEFAULT_VEIL_LAYER }),
      resetGuiLayout: () => set({
        activeProfile: DEFAULT_PROFILE,
        collapsed: DEFAULT_COLLAPSED,
        veilLayer: DEFAULT_VEIL_LAYER
      })
    }),
    {
      name: GUI_STORE_KEY,
      storage: createJSONStorage(() => getBrowserStorage()),
      partialize: (state) => ({
        activeProfile: state.activeProfile,
        collapsed: state.collapsed,
        veilLayer: state.veilLayer
      }),
      version: 2
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

function sanitizeVeilLayer(candidate) {
  if (!candidate || typeof candidate !== 'object') return {};

  const next = {};

  if (Object.hasOwn(candidate, 'enabled')) next.enabled = Boolean(candidate.enabled);
  if (typeof candidate.sourceUrl === 'string') next.sourceUrl = candidate.sourceUrl.trim();
  if (KNOWN_SOURCE_TYPES.includes(candidate.sourceType)) next.sourceType = candidate.sourceType;
  if (Object.hasOwn(candidate, 'opacity')) next.opacity = clampNumber(candidate.opacity, 0, 0.86, DEFAULT_VEIL_LAYER.opacity);
  if (Object.hasOwn(candidate, 'blur')) next.blur = clampNumber(candidate.blur, 0, 42, DEFAULT_VEIL_LAYER.blur);
  if (Object.hasOwn(candidate, 'saturation')) next.saturation = clampNumber(candidate.saturation, 0.4, 2, DEFAULT_VEIL_LAYER.saturation);
  if (Object.hasOwn(candidate, 'speed')) next.speed = clampNumber(candidate.speed, 0.25, 2, DEFAULT_VEIL_LAYER.speed);
  if (Object.hasOwn(candidate, 'reactivity')) next.reactivity = clampNumber(candidate.reactivity, 0, 1, DEFAULT_VEIL_LAYER.reactivity);
  if (Object.hasOwn(candidate, 'sphereSync')) next.sphereSync = Boolean(candidate.sphereSync);
  if (Object.hasOwn(candidate, 'flowMode')) next.flowMode = Boolean(candidate.flowMode);

  return next;
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
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
