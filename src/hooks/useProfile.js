import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGuiStore } from '../stores/guiStore.js';

export const PROFILE_DEFINITIONS = [
  { id: 'simple', label: 'Create', accent: '#73f7ff', background: 'spiral_wide.png' },
  { id: 'creator', label: 'Studio', accent: '#9b5cff', background: 'corridor_bluepink_wide.png' },
  { id: 'editor', label: 'Beat Lab', accent: '#00d3ff', background: 'energy_core_editor.png' },
  { id: 'debug', label: 'Inspect', accent: '#ffcb59', background: 'mirror_corridor_wide.png' }
];

const PROFILE_SWITCH_MS = 420;
const WORKSPACE_SWAP_MS = 200;

export function useProfile() {
  const activeProfile = useGuiStore((state) => state.activeProfile);
  const setActiveProfile = useGuiStore((state) => state.setActiveProfile);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [phase, setPhase] = useState('idle');
  const timersRef = useRef([]);

  const activeProfileDefinition = useMemo(
    () => PROFILE_DEFINITIONS.find((profile) => profile.id === activeProfile) ?? PROFILE_DEFINITIONS[1],
    [activeProfile]
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const schedulePhase = useCallback((callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.push(timerId);
  }, []);

  const switchProfile = useCallback((nextProfile) => {
    if (!nextProfile || nextProfile === activeProfile || !PROFILE_DEFINITIONS.some((profile) => profile.id === nextProfile)) {
      return;
    }

    clearTimers();
    setPendingProfile(nextProfile);
    setPhase('overlay');

    schedulePhase(() => setPhase('collapse'), 80);
    schedulePhase(() => {
      setActiveProfile(nextProfile);
      setPhase('swap');
    }, WORKSPACE_SWAP_MS);
    schedulePhase(() => setPhase('expand'), 280);
    schedulePhase(() => {
      setPendingProfile(null);
      setPhase('idle');
      timersRef.current = [];
    }, PROFILE_SWITCH_MS);
  }, [activeProfile, clearTimers, schedulePhase, setActiveProfile]);

  useEffect(() => clearTimers, [clearTimers]);

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
