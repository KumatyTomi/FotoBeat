// src/hooks/useFlowMode.ts

import { useState, useEffect, useCallback } from 'react';

export function useFlowMode() {
  const [isFlowMode, setIsFlowMode] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const enterFlowMode = useCallback(() => {
    setIsFlowMode(true);
    setSessionStart(new Date());
    document.documentElement.classList.add('flow-mode');
    // Auto snapshot, hide UI elements, expand canvas etc.
  }, []);

  const exitFlowMode = useCallback(() => {
    setIsFlowMode(false);
    document.documentElement.classList.remove('flow-mode');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        isFlowMode ? exitFlowMode() : enterFlowMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFlowMode]);

  return { isFlowMode, enterFlowMode, exitFlowMode, sessionStart };
}

// Phantom Imperial Flow CSS included in theme