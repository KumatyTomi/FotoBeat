export const VISUAL_DIRECTION = {
  id: 'launch-control-premium',
  name: 'Launch Control Premium',
  tagline: 'Aerospace-grade beat video studio for local-first creators.',
  mood: ['deep black mission-control surface', 'precision grid overlays', 'white typography with cyan telemetry accents', 'premium glass panels', 'audio-reactive energy rings', 'launch countdown rhythm', 'orbital camera drift'],
  palette: { void: '#03050a', graphite: '#080c12', panel: '#0d121b', white: '#f7fbff', muted: '#8d9aaa', telemetry: '#76e7ff', plasma: '#b8f4ff', warning: '#ffcf5f', abort: '#ff6b6b' },
  motionLanguage: { micro: '120-180ms crisp controls, no bounce', macro: 'slow orbital drift, controlled zoom, launch countdown pulses', beat: 'bass pulse drives glow, waveform amplitude drives scanline strength', transitions: 'hard telemetry cuts mixed with smoke-free light sweeps' },
  productPromise: 'Upload photos and audio, then generate a polished mission-control grade neon music video locally.'
};

export const VAIRA_CHRONO_DIRECTION = {
  id: 'vaira-chrono',
  name: 'Vaira Chrono',
  tagline: 'Luxury chronograph interface for precise beat-timed edits.',
  mood: ['black sapphire glass', 'warm amber indices', 'radial chrono dials', 'cyan timecode telemetry', 'subtle mechanical ticks', 'premium instrument panel', 'precision cut markers'],
  palette: { void: '#040403', graphite: '#0a0b0d', panel: '#151109', white: '#fff8e6', muted: '#9c917c', amber: '#f7c66a', cyan: '#60f5ff', ruby: '#ff5f6d' },
  motionLanguage: { micro: 'stepped 24-frame mechanical ticks', macro: 'slow chronograph sweep, restrained parallax, radial index drift', beat: 'kick advances chrono hand, snare flashes amber indices, drop locks into cyan timecode', transitions: 'watch-dial wipes, shutter cuts and radial timecode reveals' },
  productPromise: 'Turn photo drops into premium, timepiece-grade reels with visible rhythm precision.'
};

export const VISUAL_DIRECTIONS = [VISUAL_DIRECTION, VAIRA_CHRONO_DIRECTION];

export const LAUNCH_CONTROL_EFFECTS = [
  { id: 'launchControl', name: 'Launch Control', description: 'Precyzyjny mission-control look: czarne panele, telemetry grid, audio pulse i launch countdown.', intensity: 88, bestFor: 'intro premium, logo reveal, beat-driven opener', direction: 'launch-control-premium' },
  { id: 'orbitalReactor', name: 'Orbital Reactor', description: 'Orbitalny drift kamery, pierścienie energii wokół kadru i zimny cyan glow pod bas.', intensity: 84, bestFor: 'teledyski, dynamiczne zdjęcia, futurystyczny branding', direction: 'launch-control-premium' },
  { id: 'telemetryPulse', name: 'Telemetry Pulse', description: 'HUD, scanlines, wykresy, mikroruch i mocne cięcia zsynchronizowane z waveformem.', intensity: 78, bestFor: 'tech demo, shorty, szybkie cięcia pod beat', direction: 'launch-control-premium' },
  { id: 'plasmaIgnition', name: 'Plasma Ignition', description: 'Energetyczny zapłon logo: biały flash, cyan plasma i miękki afterglow bez tandetnego glitchu.', intensity: 92, bestFor: 'logo intro, drop, mocne wejście refrenu', direction: 'launch-control-premium' },
  { id: 'vairaChrono', name: 'Vaira Chrono', description: 'Zegarkowy chrono-HUD: radialne indeksy, bursztynowe ticki i timecode pod beat.', intensity: 86, bestFor: 'premium reels, produkt, techniczny launch', direction: 'vaira-chrono' }
];
