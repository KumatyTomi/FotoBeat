// VeilLayer.tsx - gotowy komponent z tłem z Imagine

import React from 'react';

export default function VeilLayer({ mediaSrc = 'your-imagine-video.mp4' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.25, filter: 'blur(6px)', mixBlendMode: 'screen' }}>
      <video autoPlay loop muted src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

// Dodaj do swojego preview: <VeilLayer mediaSrc="C:/path/to/your/imagine-clip.mp4" />