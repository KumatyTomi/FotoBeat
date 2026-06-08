import { useEffect, useState } from 'react';
import { DEFAULT_PROJECT, STORAGE_KEY, loadProject } from '../utils/projectExport.js';

export function useProjectState() {
  const [project, setProject] = useState(() => loadProject());
  const [lastSavedAt, setLastSavedAt] = useState(project.updatedAt ?? null);
  const [projectIoStatus, setProjectIoStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    const nextProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject));
    setLastSavedAt(nextProject.updatedAt);
  }, [project]);

  function patchProject(patch) {
    setProject((current) => ({
      ...current,
      ...patch
    }));
  }

  function replaceProject(importedProject) {
    setProject({
      ...DEFAULT_PROJECT,
      ...importedProject,
      importedAt: new Date().toISOString()
    });
  }

  function addSnapshot(snapshot) {
    setProject((current) => ({
      ...current,
      snapshots: [snapshot, ...current.snapshots].slice(0, 10)
    }));
  }

  return {
    project,
    lastSavedAt,
    projectIoStatus,
    setProjectIoStatus,
    patchProject,
    replaceProject,
    addSnapshot
  };
}
