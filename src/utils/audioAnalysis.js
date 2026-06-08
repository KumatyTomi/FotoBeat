export async function analyzeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const channel = audioBuffer.getChannelData(0);
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.max(1024, Math.floor(sampleRate * 0.18));
  const energyWindows = buildEnergyWindows(channel, windowSize, sampleRate);
  const waveform = buildWaveform(channel, 96);
  const transientBeats = detectTransientBeats(energyWindows, duration);
  const averageEnergy = energyWindows.reduce((sum, value) => sum + value.energy, 0) / Math.max(energyWindows.length, 1);
  const normalizedEnergy = Math.min(1, Math.max(0.25, averageEnergy * 5));
  const estimatedBpm = estimateBpm(transientBeats, normalizedEnergy);
  const fallbackBeats = buildFallbackBeats(estimatedBpm, Math.min(64, Math.ceil(duration / (60 / estimatedBpm))));
  const beats = transientBeats.length >= 4 ? transientBeats.slice(0, 96) : fallbackBeats;

  context.close?.();

  return {
    status: 'ready',
    fileName: file.name,
    duration: Number(duration.toFixed(2)),
    bpm: estimatedBpm,
    energy: Number(normalizedEnergy.toFixed(2)),
    averageBeatStep: Number((60 / estimatedBpm).toFixed(2)),
    waveform,
    beats,
    transientCount: transientBeats.length,
    analysisMode: transientBeats.length >= 4 ? 'transient' : 'energy-fallback'
  };
}

export function buildEnergyWindows(channel, windowSize, sampleRate) {
  const windows = [];

  for (let offset = 0; offset < channel.length; offset += windowSize) {
    let sum = 0;
    let peak = 0;
    const end = Math.min(offset + windowSize, channel.length);

    for (let index = offset; index < end; index += 1) {
      const value = Math.abs(channel[index]);
      sum += value;
      peak = Math.max(peak, value);
    }

    windows.push({
      time: Number((offset / sampleRate).toFixed(3)),
      energy: sum / Math.max(end - offset, 1),
      peak
    });
  }

  return windows;
}

export function detectTransientBeats(energyWindows, duration) {
  if (energyWindows.length < 5) return [];

  const average = energyWindows.reduce((sum, item) => sum + item.energy, 0) / energyWindows.length;
  const sorted = [...energyWindows].sort((a, b) => a.energy - b.energy);
  const p75 = sorted[Math.floor(sorted.length * 0.75)]?.energy ?? average;
  const threshold = Math.max(average * 1.32, p75 * 1.08);
  const minGap = 0.28;
  const beats = [];

  for (let index = 1; index < energyWindows.length - 1; index += 1) {
    const previous = energyWindows[index - 1];
    const current = energyWindows[index];
    const next = energyWindows[index + 1];
    const isLocalPeak = current.energy >= previous.energy && current.energy >= next.energy;
    const isStrongEnough = current.energy >= threshold || current.peak >= Math.max(previous.peak, next.peak) * 1.12;
    const farEnough = beats.length === 0 || current.time - beats.at(-1).time >= minGap;

    if (isLocalPeak && isStrongEnough && farEnough && current.time <= duration) {
      beats.push({
        time: Number(current.time.toFixed(2)),
        energy: Number(Math.min(1, Math.max(0.35, current.energy * 7)).toFixed(2))
      });
    }
  }

  return beats;
}

export function estimateBpm(beats, normalizedEnergy) {
  if (beats.length >= 4) {
    const intervals = [];

    for (let index = 1; index < beats.length; index += 1) {
      const interval = beats[index].time - beats[index - 1].time;
      if (interval >= 0.28 && interval <= 1.2) intervals.push(interval);
    }

    if (intervals.length) {
      const sorted = intervals.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const bpm = Math.round(60 / median);
      return clampBpm(normalizeBpmRange(bpm));
    }
  }

  return normalizedEnergy > 0.68 ? 132 : normalizedEnergy > 0.48 ? 118 : 96;
}

export function buildWaveform(channel, buckets) {
  const bucketSize = Math.max(1, Math.floor(channel.length / buckets));
  const values = [];

  for (let bucket = 0; bucket < buckets; bucket += 1) {
    let peak = 0;
    const start = bucket * bucketSize;
    const end = Math.min(start + bucketSize, channel.length);

    for (let index = start; index < end; index += 1) {
      peak = Math.max(peak, Math.abs(channel[index]));
    }

    values.push(Number(Math.min(1, peak * 2.2).toFixed(3)));
  }

  return values;
}

export function buildFallbackWaveform(count) {
  return Array.from({ length: count }).map((_, index) => (
    Number((0.25 + Math.abs(Math.sin(index * 0.38)) * 0.65).toFixed(3))
  ));
}

export function buildFallbackBeats(bpm, count) {
  const step = 60 / bpm;

  return Array.from({ length: count }).map((_, index) => ({
    time: Number((index * step).toFixed(2)),
    energy: Number((0.5 + ((index % 4) * 0.12)).toFixed(2))
  }));
}

export function describeAudioAnalysis(audioAnalysis) {
  if (audioAnalysis.status === 'analyzing') {
    return `Analizuję plik ${audioAnalysis.fileName} i przygotowuję siatkę cięć.`;
  }

  if (audioAnalysis.status === 'fallback') {
    return `Używam awaryjnej beat mapy dla ${audioAnalysis.fileName}.`;
  }

  const mode = audioAnalysis.analysisMode === 'transient'
    ? `, transienty: ${audioAnalysis.transientCount}`
    : ', tryb energii/fallback';

  return `Plik ${audioAnalysis.fileName}: długość ${audioAnalysis.duration}s, szacunkowe BPM ${audioAnalysis.bpm}${mode}.`;
}

function normalizeBpmRange(bpm) {
  let normalized = bpm;

  while (normalized < 80) normalized *= 2;
  while (normalized > 170) normalized /= 2;

  return Math.round(normalized);
}

function clampBpm(bpm) {
  return Math.max(72, Math.min(180, bpm));
}
