import { RENDER_PROFILES, getRenderProfile } from '../data/renderProfiles.js';

export const MP4_PROFILE_AUTO_ID = 'auto';
export const MP4_PROFILE_STORAGE_KEY = 'fotobeat.mp4ProfileId';

const DEFAULT_MP4_PROFILE_ID = 'mp4-poc';

export const MP4_PROFILE_CHOICES = [
  { id: MP4_PROFILE_AUTO_ID, label: 'Auto', target: 'Proporcje sekwencji', quality: 'recommended' },
  ...RENDER_PROFILES.filter((profile) => profile.container === 'mp4')
];

export function readStoredMp4ProfileId(fallbackProfileId = DEFAULT_MP4_PROFILE_ID) {
  if (typeof window === 'undefined') return fallbackProfileId;

  try {
    const storedProfileId = window.localStorage?.getItem(MP4_PROFILE_STORAGE_KEY);
    return isKnownMp4ProfileId(storedProfileId) ? storedProfileId : fallbackProfileId;
  } catch {
    return fallbackProfileId;
  }
}

export function writeStoredMp4ProfileId(profileId) {
  if (typeof window === 'undefined') return;

  const safeProfileId = isKnownMp4ProfileId(profileId) ? profileId : MP4_PROFILE_AUTO_ID;

  try {
    window.localStorage?.setItem(MP4_PROFILE_STORAGE_KEY, safeProfileId);
    window.dispatchEvent(new window.CustomEvent('fotobeat:mp4-profile-change', { detail: { profileId: safeProfileId } }));
  } catch {
    // Profile persistence is optional; export can still use its direct fallback.
  }
}

export function resolveMp4ProfileId({
  profileId = DEFAULT_MP4_PROFILE_ID,
  sequence = null,
  includeAudio = false,
  preferStored = false
} = {}) {
  const requestedProfileId = preferStored ? readStoredMp4ProfileId(profileId) : profileId;
  const resolvedProfileId = requestedProfileId === MP4_PROFILE_AUTO_ID ? getRecommendedMp4ProfileId(sequence) : requestedProfileId;

  if (includeAudio && resolvedProfileId === 'mp4-poc') return 'mp4-audio-poc';
  if (!includeAudio && resolvedProfileId === 'mp4-audio-poc') return 'mp4-poc';

  return resolvedProfileId;
}

export function getRecommendedMp4ProfileId(sequence) {
  if (sequence?.width && sequence?.height) {
    if (sequence.width === sequence.height) return 'mp4-square-social';
    if (sequence.width > sequence.height) return 'mp4-wide-hd';
  }

  return 'mp4-mobile-vertical';
}

export function getMp4ProfileSummary(profileId) {
  if (profileId === MP4_PROFILE_AUTO_ID) {
    return {
      id: MP4_PROFILE_AUTO_ID,
      label: 'Auto',
      target: 'Proporcje sekwencji',
      quality: 'recommended',
      width: null,
      height: null,
      maxDuration: null,
      crf: null,
      preset: null
    };
  }

  return getRenderProfile(profileId);
}

export function getResolvedMp4Profile(options = {}) {
  return getRenderProfile(resolveMp4ProfileId(options));
}

function isKnownMp4ProfileId(profileId) {
  return MP4_PROFILE_CHOICES.some((profile) => profile.id === profileId);
}
