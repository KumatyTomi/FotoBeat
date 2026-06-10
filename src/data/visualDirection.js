export const VISUAL_DIRECTION = {
  id: 'launch-control-premium',
  name: 'Launch Control Premium',
  tagline: 'Aerospace-grade beat video studio for local-first creators.',
  mood: [
    'deep black mission-control surface',
    'precision grid overlays',
    'white typography with cyan telemetry accents',
    'premium glass panels',
    'audio-reactive energy rings',
    'launch countdown rhythm',
    'orbital camera drift'
  ],
  palette: {
    void: '#03050a',
    graphite: '#080c12',
    panel: '#0d121b',
    white: '#f7fbff',
    muted: '#8d9aaa',
    telemetry: '#76e7ff',
    plasma: '#b8f4ff',
    warning: '#ffcf5f',
    abort: '#ff6b6b'
  },
  motionLanguage: {
    micro: '120-180ms crisp controls, no bounce',
    macro: 'slow orbital drift, controlled zoom, launch countdown pulses',
    beat: 'bass pulse drives glow, waveform amplitude drives scanline strength',
    transitions: 'hard telemetry cuts mixed with smoke-free light sweeps'
  },
  productPromise: 'Upload photos and audio, then generate a polished mission-control grade neon music video locally.'
};

export const LAUNCH_CONTROL_EFFECTS = [
  {
    id: 'launchControl',
    name: 'Launch Control',
    description: 'Precyzyjny mission-control look: czarne panele, telemetry grid, audio pulse i launch countdown.',
    intensity: 88,
    bestFor: 'intro premium, logo reveal, beat-driven opener',
    direction: 'launch-control-premium'
  },
  {
    id: 'orbitalReactor',
    name: 'Orbital Reactor',
    description: 'Orbitalny drift kamery, pierścienie energii wokół kadru i zimny cyan glow pod bas.',
    intensity: 84,
    bestFor: 'teledyski, dynamiczne zdjęcia, futurystyczny branding',
    direction: 'launch-control-premium'
  },
  {
    id: 'telemetryPulse',
    name: 'Telemetry Pulse',
    description: 'HUD, scanlines, wykresy, mikroruch i mocne cięcia zsynchronizowane z waveformem.',
    intensity: 78,
    bestFor: 'tech demo, shorty, szybkie cięcia pod beat',
    direction: 'launch-control-premium'
  },
  {
    id: 'plasmaIgnition',
    name: 'Plasma Ignition',
    description: 'Energetyczny zapłon logo: biały flash, cyan plasma i miękki afterglow bez tandetnego glitchu.',
    intensity: 92,
    bestFor: 'logo intro, drop, mocne wejście refrenu',
    direction: 'launch-control-premium'
  }
];
