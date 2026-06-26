import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGuiStore } from '../stores/guiStore.js';

export const PROFILE_DEFINITIONS = [
  {
    id: 'simple',
    label: 'Start',
    shortLabel: 'Panel startowy',
    accent: '#73f7ff',
    scene: 'cosmic-water',
    description: 'Import, szybki projekt i spokojne prowadzenie bez technicznych opcji.'
  },
  {
    id: 'creator',
    label: 'Studio',
    shortLabel: 'Panel kreacji',
    accent: '#9b5cff',
    scene: 'liquid-gate',
    description: 'Interaktywny wybór stylu, presetów, tempa i dramaturgii montażu.'
  },
  {
    id: 'editor',
    label: 'Render',
    shortLabel: 'Panel renderu',
    accent: '#00d3ff',
    scene: 'fractal-engine',
    description: 'Podgląd, timeline, sekwencje klatek i eksport w jednym panelu pracy.'
  },
  {
    id: 'debug',
    label: 'Admin',
    shortLabel: 'Debug admin',
    accent: '#ffcb59',
    scene: 'admin-bloom',
    description: 'Ukryty panel administracyjny z JSON, diagnostyką i opcjami technicznymi.'
  }
];

const PROFILE_SWITCH_MS = 720;
const WORKSPACE_SWAP_MS = 320;

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

    schedulePhase(() => setPhase('liquid'), 90);
    schedulePhase(() => setPhase('collapse'), 180);
    schedulePhase(() => {
      setActiveProfile(nextProfile);
      setPhase('swap');
    }, WORKSPACE_SWAP_MS);
    schedulePhase(() => setPhase('expand'), 460);
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
