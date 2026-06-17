import { useEffect, useMemo, useState } from 'react';
import { Film } from 'lucide-react';
import {
  MP4_PROFILE_AUTO_ID,
  MP4_PROFILE_CHOICES,
  MP4_PROFILE_STORAGE_KEY,
  getMp4ProfileSummary,
  readStoredMp4ProfileId,
  writeStoredMp4ProfileId
} from '../utils/mp4ProfileSelection.js';

export default function Mp4ProfileSelector() {
  const [profileId, setProfileId] = useState(() => readStoredMp4ProfileId(MP4_PROFILE_AUTO_ID));
  const selectedProfile = useMemo(() => getMp4ProfileSummary(profileId), [profileId]);
  const sizeLabel = selectedProfile.width && selectedProfile.height ? `${selectedProfile.width}x${selectedProfile.height}` : 'z sekwencji';
  const durationLabel = selectedProfile.maxDuration ? `${selectedProfile.maxDuration}s` : 'auto';
  const crfLabel = selectedProfile.crf ? `CRF ${selectedProfile.crf}` : 'dobierany';
  const presetLabel = selectedProfile.preset ?? 'auto';

  useEffect(() => {
    writeStoredMp4ProfileId(profileId);
  }, [profileId]);

  useEffect(() => {
    function syncProfile(event) {
      if (event.type === 'storage' && event.key && event.key !== MP4_PROFILE_STORAGE_KEY) return;
      setProfileId(readStoredMp4ProfileId(MP4_PROFILE_AUTO_ID));
    }

    window.addEventListener('storage', syncProfile);
    window.addEventListener('fotobeat:mp4-profile-change', syncProfile);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('fotobeat:mp4-profile-change', syncProfile);
    };
  }, []);

  return (
    <div className="mp4-profile-selector">
      <div className="mp4-profile-selector-heading">
        <div>
          <p className="panel-kicker">MP4 profile</p>
          <h3>Profil eksportu MP4</h3>
        </div>
        <Film size={20} aria-hidden="true" />
      </div>

      <div className="mp4-profile-selector-actions" role="group" aria-label="Profile eksportu MP4">
        {MP4_PROFILE_CHOICES.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={`chip ${profileId === profile.id ? 'active' : ''}`}
            onClick={() => setProfileId(profile.id)}
            aria-pressed={profileId === profile.id}
          >
            {profile.label}
          </button>
        ))}
      </div>

      <div className="mp4-profile-meta" aria-label="Parametry aktywnego profilu MP4">
        <span>{selectedProfile.target}</span>
        <span>{sizeLabel}</span>
        <span>{durationLabel}</span>
        <span>{crfLabel}</span>
        <span>{presetLabel}</span>
      </div>
    </div>
  );
}
