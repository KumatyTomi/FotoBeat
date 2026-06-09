import { useEffect, useState } from 'react';
import { analyzeAudioFile, buildFallbackBeats, buildFallbackWaveform } from '../utils/audioAnalysis.js';

export function useAudioAnalysis(audio) {
  const [audioAnalysis, setAudioAnalysis] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (audio) {
        window.__fotobeatDesktopAudioFile = audio;
      } else {
        delete window.__fotobeatDesktopAudioFile;
      }
    }

    if (!audio) {
      setAudioAnalysis(null);
      return;
    }

    let cancelled = false;
    setAudioAnalysis({ status: 'analyzing', fileName: audio.name });

    analyzeAudioFile(audio)
      .then((result) => {
        if (!cancelled) setAudioAnalysis(result);
      })
      .catch(() => {
        if (!cancelled) {
          setAudioAnalysis({
            status: 'fallback',
            fileName: audio.name,
            bpm: 120,
            energy: 0.62,
            duration: 0,
            averageBeatStep: 0.5,
            waveform: buildFallbackWaveform(64),
            beats: buildFallbackBeats(120, 48)
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [audio]);

  return audioAnalysis;
}
