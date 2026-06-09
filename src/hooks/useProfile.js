import { useCallback, useMemo, useState } from 'react';

export const PROFILE_DEFINITIONS = [
  { id: 'simple', label: 'Simple', accent: '#8be9ff', background: 'spiral_wide.png' },
  { id: 'creator', label: 'Creator', accent: '#7c3cff', background: 'corridor_bluepink_wide.png' },
  { id: 'editor', label: 'Editor', accent: '#00d3ff', background: 'energy_core_editor.png' },
  { id: 'debug', label: 'Debug', accent: '#ffcb59', background: 'mirror_corridor_wide.png' }
];

const CONFIG_KEY = 'fotobeat.gui.v3.config';
const DEFAULT_PROFILE = 'creator';
const PROFILE_SWITCH_MS = 420;
const WORKSPACE_SWAP_MS = 200;

export function useProfile() {
  const [activeProfile, setActiveProfile] = useState(() => readConfig().activeProfile ?? DEFAULT_PROFILE);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [phase, setPhase] = useState('idle');

  const activeProfileDefinition = useMemo(
    () => PROFILE_DEFINITIONS.find((profile) => profile.id === activeProfile) ?? PROFILE_DEFINITIONS[1],
    [activeProfile]
  );

  const switchProfile = useCallback((nextProfile) => {
    if (!nextProfile || nextProfile === activeProfile || !PROFILE_DEFINITIONS.some((profile) => profile.id === nextProfile)) {
      return;
    }

    setPendingProfile(nextProfile);
    setPhase('overlay');

    window.setTimeout(() => setPhase('collapse'), 80);
    window.setTimeout(() => {
      setActiveProfile(nextProfile);
      writeConfig({ activeProfile: nextProfile });
      setPhase('swap');
    }, WORKSPACE_SWAP_MS);
    window.setTimeout(() => setPhase('expand'), 280);
    window.setTimeout(() => {
      setPendingProfile(null);
      setPhase('idle');
    }, PROFILE_SWITCH_MS);
  }, [activeProfile]);

  return {
    activeProfile,
    activeProfileDefinition,
    pendingProfile,
    profiles: PROFILE_DEFINITIONS,
    phase,
    switching: phase !== 'idle',
    switchProfile
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
