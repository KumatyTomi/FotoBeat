export const EXPORT_FORMATS = [
  { id: 'wide', label: '16:9 Full HD', width: 1920, height: 1080, recommendedFor: 'YouTube, ekran TV, landing demo' },
  { id: 'vertical', label: '9:16 Reels/TikTok', width: 1080, height: 1920, recommendedFor: 'TikTok, Reels, Shorts' },
  { id: 'square', label: '1:1 Feed', width: 1080, height: 1080, recommendedFor: 'Posty feed, miniatury, social preview' }
];

export const EFFECT_PRESETS = [
  { id: 'neonPulse', name: 'Neon Pulse', description: 'Pulsujące światło, zoom i kontrast pod beat.', intensity: 82, bestFor: 'dynamiczne montaże, kluby, dropy' },
  { id: 'smokeCut', name: 'Smoke Cut', description: 'Dymowe przejścia, miękkie fade i głębia.', intensity: 58, bestFor: 'klimat, portrety, wolniejsze wejścia' },
  { id: 'matrixGlitch', name: 'Matrix Glitch', description: 'Zielone przebłyski, cyfrowy glitch i szybkie cięcia.', intensity: 90, bestFor: 'techno, cyberpunk, szybkie sekwencje' },
  { id: 'sinCity', name: 'Sin City', description: 'Mocny kontrast, selektywny kolor i filmowy mrok.', intensity: 70, bestFor: 'mrok, noir, mocne kadry' },
  { id: 'spiralZoom', name: 'Spiral Zoom', description: 'Zoom spiralny, rotacja i wejście w centrum kadru.', intensity: 76, bestFor: 'intro, build-up, przejście do dropu' },
  { id: 'dreamFade', name: 'Dream Fade', description: 'Miękkie światło, wolniejsze przejścia i lekka poświata.', intensity: 46, bestFor: 'rodzinne klipy, emocjonalne sekwencje' },
  {
    id: 'vairaChrono',
    name: 'Vaira Chrono',
    description: 'Premium chrono-HUD: bursztynowe indeksy, czarne szkło, radialne tarcze i precyzyjne timecode cuts.',
    intensity: 86,
    bestFor: 'premium reels, zegarkowy klimat, techniczny launch'
  }
];
