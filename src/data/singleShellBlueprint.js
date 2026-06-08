export const SHELL_PROFILES = [
  {
    id: 'simple',
    label: 'Simple',
    description: 'Minimalny flow dla użytkownika końcowego: zdjęcia, muzyka, template, preview i render.',
    centerWorkspace: 'quick_creator',
    visibleSections: ['project', 'media', 'audio_basic', 'templates', 'preview', 'render', 'support'],
    hiddenSections: ['timeline', 'batch', 'cache', 'telemetry', 'runtime_logs', 'debug_tools']
  },
  {
    id: 'creator',
    label: 'Creator',
    description: 'Domyślny tryb kreatora z mediami, stylem, audio, eksportem i kompaktową kolejką.',
    centerWorkspace: 'creator_workspace',
    visibleSections: ['project', 'media', 'audio_basic', 'templates', 'style', 'photo_selection', 'preview', 'export', 'queue_compact'],
    hiddenSections: ['runtime_logs', 'internal_bundle', 'raw_cache']
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Pełny ręczny edytor w tym samym oknie: timeline, klipy, audio markers, motion i eksport.',
    centerWorkspace: 'manual_editor_workspace',
    visibleSections: ['project', 'media', 'audio_basic', 'timeline', 'manual_clips', 'transitions', 'motion', 'audio_markers', 'preview', 'export', 'queue_full', 'storage'],
    hiddenSections: ['runtime_logs', 'internal_bundle']
  },
  {
    id: 'debug',
    label: 'Debug',
    description: 'Tryb techniczny: runtime checks, logs, queue history, telemetry, cache i internal bundle.',
    centerWorkspace: 'debug_workspace',
    visibleSections: ['project', 'media', 'audio_basic', 'timeline', 'export', 'queue_full', 'storage', 'runtime_logs', 'telemetry', 'cache', 'internal_bundle', 'debug_tools'],
    hiddenSections: []
  }
];

export const SHELL_REGIONS = [
  {
    id: 'topbar',
    label: 'Topbar',
    purpose: 'Brand, profile switcher, autosave state and primary render action.',
    sections: ['brand', 'profile_switcher', 'autosave', 'primary_render']
  },
  {
    id: 'left_rail',
    label: 'Left rail',
    purpose: 'Compact navigation, icon-first by default, expandable labels.',
    collapsedByDefault: true,
    sections: ['project', 'media', 'audio', 'timeline', 'export', 'support']
  },
  {
    id: 'center_workspace',
    label: 'Center workspace',
    purpose: 'Profile-dependent workspace: quick creator, creator canvas, manual editor or debug workspace.',
    sections: ['quick_creator', 'creator_workspace', 'manual_editor_workspace', 'debug_workspace']
  },
  {
    id: 'right_drawer',
    label: 'Right drawer',
    purpose: 'Contextual controls and accordion groups.',
    collapsedByDefault: true,
    sections: ['templates', 'style', 'photo_selection', 'music', 'audio_markers', 'export', 'batch']
  },
  {
    id: 'bottom_status_queue',
    label: 'Bottom status / queue',
    purpose: 'Render queue, warnings, performance, storage health and support status.',
    sections: ['queue', 'warnings', 'performance', 'storage', 'support_status']
  },
  {
    id: 'overlay_transition',
    label: 'Transition overlay',
    purpose: 'Non-blocking glow/blur transition during profile changes.',
    sections: ['profile_glow', 'workspace_swap']
  }
];

export const SHELL_ANIMATION_SPECS = {
  profileSwitch: {
    durationMs: 420,
    steps: 14,
    easing: 'ease_out_cubic',
    phases: ['overlay glow', 'collapse old drawers', 'swap workspace', 'expand target drawers', 'settle']
  },
  drawerExpand: {
    durationMs: 220,
    steps: 9,
    easing: 'ease_out_cubic'
  },
  accordionToggle: {
    durationMs: 180,
    steps: 8,
    easing: 'ease_out_cubic'
  },
  buttonHover: {
    durationMs: 90,
    steps: 4,
    properties: ['border glow', 'scale proxy via padding', 'foreground pulse']
  }
};

export const SHELL_MIGRATION_STAGES = [
  {
    id: 'shell_blueprint',
    label: 'Shell blueprint',
    status: 'done',
    tasks: ['Extract desktop GUI v3 plan', 'Create web data model', 'Create shell preview component']
  },
  {
    id: 'non_invasive_preview',
    label: 'Non-invasive shell preview',
    status: 'ready',
    tasks: ['Render blueprint beside current app', 'Validate profile matrix', 'Keep current render pipeline untouched']
  },
  {
    id: 'section_migration',
    label: 'Section migration',
    status: 'planned',
    tasks: ['Move existing panels into shell regions', 'Replace scattered panels with section registry', 'Persist collapsed state']
  },
  {
    id: 'profile_switcher',
    label: 'Profile switcher',
    status: 'planned',
    tasks: ['Activate Simple/Creator/Editor/Debug profiles', 'Animate workspace swap', 'Hide debug tools from normal profiles']
  },
  {
    id: 'editor_workspace',
    label: 'Editor workspace inside shell',
    status: 'planned',
    tasks: ['Move manual timeline controls into center workspace', 'Add right drawer editor tools', 'Expose bottom render queue']
  }
];

export function getShellProfile(profileId) {
  return SHELL_PROFILES.find((profile) => profile.id === profileId) ?? SHELL_PROFILES[1];
}

export function getVisibleRegionsForProfile(profileId) {
  const profile = getShellProfile(profileId);

  return SHELL_REGIONS.map((region) => ({
    ...region,
    activeSections: region.sections.filter((section) => profile.visibleSections.includes(section) || isAlwaysVisibleShellSection(section))
  }));
}

function isAlwaysVisibleShellSection(section) {
  return ['brand', 'profile_switcher', 'autosave', 'primary_render', 'profile_glow', 'workspace_swap'].includes(section);
}
