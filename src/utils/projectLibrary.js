import { safeFilename } from './projectExport.js';

export const PROJECT_LIBRARY_STORAGE_KEY = 'fotobeat.project-library.v1';
export const MAX_PROJECT_LIBRARY_ENTRIES = 12;

export function createProjectLibraryId(projectName, now = Date.now()) {
  return `${safeFilename(projectName || 'fotobeat-project')}-${now}`;
}

export function buildProjectLibraryEntry(projectPayload, { id, savedAt = new Date().toISOString() } = {}) {
  if (!isProjectPayload(projectPayload)) {
    throw new Error('Nie można zapisać niepoprawnego projektu w bibliotece.');
  }

  const project = projectPayload.project ?? {};
  const entryId = id || project.libraryId || createProjectLibraryId(project.name, Date.parse(savedAt) || Date.now());

  return {
    id: entryId,
    savedAt,
    name: project.name || 'Projekt FotoBeat',
    format: project.format || projectPayload.timeline?.format || 'unknown',
    preset: project.preset || projectPayload.timeline?.preset || 'unknown',
    renderVariant: project.renderVariant || 'hardBeat',
    mediaCount: projectPayload.media?.imageCount ?? 0,
    selectedImageCount: projectPayload.media?.selectedImageCount ?? 0,
    audioName: projectPayload.media?.audioName ?? null,
    estimatedDuration: projectPayload.timeline?.estimatedDuration ?? 0,
    payload: {
      ...projectPayload,
      project: {
        ...project,
        libraryId: entryId
      }
    }
  };
}

export function upsertProjectLibraryEntry(entries = [], projectPayload, options = {}) {
  const currentEntries = normalizeProjectLibraryEntries(entries);
  const entry = buildProjectLibraryEntry(projectPayload, options);
  const withoutExisting = currentEntries.filter((item) => item.id !== entry.id);

  return [entry, ...withoutExisting].slice(0, MAX_PROJECT_LIBRARY_ENTRIES);
}

export function removeProjectLibraryEntry(entries = [], entryId) {
  return normalizeProjectLibraryEntries(entries).filter((entry) => entry.id !== entryId);
}

export function loadProjectLibrary(storage = getDefaultStorage()) {
  try {
    const raw = storage?.getItem(PROJECT_LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    return normalizeProjectLibraryEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function persistProjectLibrary(entries = [], storage = getDefaultStorage()) {
  const normalizedEntries = normalizeProjectLibraryEntries(entries);
  storage?.setItem(PROJECT_LIBRARY_STORAGE_KEY, JSON.stringify(normalizedEntries));
  return normalizedEntries;
}

export function normalizeProjectLibraryEntries(entries = []) {
  return Array.isArray(entries)
    ? entries
      .filter((entry) => entry?.id && isProjectPayload(entry.payload))
      .map((entry) => ({
        id: entry.id,
        savedAt: entry.savedAt || entry.payload.exportedAt || new Date(0).toISOString(),
        name: entry.name || entry.payload.project?.name || 'Projekt FotoBeat',
        format: entry.format || entry.payload.project?.format || entry.payload.timeline?.format || 'unknown',
        preset: entry.preset || entry.payload.project?.preset || entry.payload.timeline?.preset || 'unknown',
        renderVariant: entry.renderVariant || entry.payload.project?.renderVariant || 'hardBeat',
        mediaCount: Number.isFinite(entry.mediaCount) ? entry.mediaCount : entry.payload.media?.imageCount ?? 0,
        selectedImageCount: Number.isFinite(entry.selectedImageCount) ? entry.selectedImageCount : entry.payload.media?.selectedImageCount ?? 0,
        audioName: entry.audioName ?? entry.payload.media?.audioName ?? null,
        estimatedDuration: Number.isFinite(entry.estimatedDuration) ? entry.estimatedDuration : entry.payload.timeline?.estimatedDuration ?? 0,
        payload: entry.payload
      }))
      .slice(0, MAX_PROJECT_LIBRARY_ENTRIES)
    : [];
}

function isProjectPayload(value) {
  return value?.schema === 'fotobeat.project.v1' && Boolean(value.project);
}

function getDefaultStorage() {
  return globalThis.localStorage;
}
