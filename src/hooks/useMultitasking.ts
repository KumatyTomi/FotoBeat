// src/hooks/useMultitasking.ts
import { useState, useCallback } from 'react';

export function useMultitasking() {
  const [activeProjects, setActiveProjects] = useState([1, 2, 3, 4]);
  const [currentFocus, setCurrentFocus] = useState(1);
  const [renderQueue, setRenderQueue] = useState(3);
  const [flowIntegrated, setFlowIntegrated] = useState(true);

  const switchProject = (id: number) => {
    setCurrentFocus(id);
    // Animacja + canvas swap
    document.getElementById('main-canvas')?.classList.add('project-swap');
    setTimeout(() => document.getElementById('main-canvas')?.classList.remove('project-swap'), 600);
  };

  const renderAll = () => {
    alert('🚀 Render Queue: Wszystkie 4 projekty w kolejce z priorytetem beat-sync');
    setRenderQueue(0);
    setTimeout(() => setRenderQueue(4), 1200);
  };

  const toggleFlow = () => {
    document.dispatchEvent(new CustomEvent('enterFlowMode'));
  };

  return {
    activeProjects,
    currentFocus,
    renderQueue,
    switchProject,
    renderAll,
    toggleFlow
  };
}