import { SHELL_ANIMATION_SPECS, SHELL_MIGRATION_STAGES, SHELL_PROFILES, getVisibleRegionsForProfile } from '../data/singleShellBlueprint.js';

export default function SingleShellBlueprint({ activeProfileId = 'creator' }) {
  const activeProfile = SHELL_PROFILES.find((profile) => profile.id === activeProfileId) ?? SHELL_PROFILES[1];
  const regions = getVisibleRegionsForProfile(activeProfile.id);

  return (
    <section className="single-shell-blueprint" aria-label="FotoBeat single shell blueprint">
      <div className="single-shell-blueprint__header">
        <div>
          <p className="panel-kicker">Imported GUI v3 concept</p>
          <h2>Single-shell web blueprint</h2>
          <p>{activeProfile.description}</p>
        </div>
        <div className="single-shell-blueprint__profiles">
          {SHELL_PROFILES.map((profile) => (
            <span key={profile.id} className={profile.id === activeProfile.id ? 'active' : ''}>{profile.label}</span>
          ))}
        </div>
      </div>

      <div className="single-shell-blueprint__grid">
        {regions.map((region) => (
          <article key={region.id} className={`single-shell-region single-shell-region--${region.id}`}>
            <span>{region.label}</span>
            <strong>{region.purpose}</strong>
            <div className="single-shell-region__sections">
              {(region.activeSections.length ? region.activeSections : region.sections).map((section) => (
                <em key={section}>{section}</em>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="single-shell-blueprint__footer">
        <article>
          <span>Animation plan</span>
          <strong>{SHELL_ANIMATION_SPECS.profileSwitch.durationMs}ms profile switch</strong>
          <p>{SHELL_ANIMATION_SPECS.profileSwitch.phases.join(' → ')}</p>
        </article>
        <article>
          <span>Migration stages</span>
          <strong>{SHELL_MIGRATION_STAGES.filter((stage) => stage.status === 'done').length}/{SHELL_MIGRATION_STAGES.length} complete</strong>
          <p>{SHELL_MIGRATION_STAGES.map((stage) => `${stage.label}: ${stage.status}`).join(' · ')}</p>
        </article>
      </div>
    </section>
  );
}
