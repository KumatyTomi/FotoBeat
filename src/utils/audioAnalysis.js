export async function analyzeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const channel = audioBuffer.getChannelData(0);
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.max(1024, Math.floor(sampleRate * 0.25));
  const energies = [];

  for (let offset = 0; offset < channel.length; offset += windowSize) {
    let sum = 0;
    const end = Math.min(offset + windowSize, channel.length);

    for (let index = offset; index < end; index += 1) {
      sum += Math.abs(channel[index]);
    }

    energies.push(sum / Math.max(end - offset, 1));
  }

  const averageEnergy = energies.reduce((sum, value) => sum + value, 0) / Math.max(energies.length, 1);
  const normalizedEnergy = Math.min(1, Math.max(0.25, averageEnergy * 5));
  const estimatedBpm = normalizedEnergy > 0.68 ? 132 : normalizedEnergy > 0.48 ? 118 : 96;
  const beats = buildFallbackBeats(estimatedBpm, Math.min(64, Math.ceil(duration / (60 / estimatedBpm))));
  const waveform = buildWaveform(channel, 72);

  context.close?.();

  return {
    status: 'ready',
    fileName: file.name,
    duration: Number(duration.toFixed(2)),
    bpm: estimatedBpm,
    energy: Number(normalizedEnergy.toFixed(2)),
    averageBeatStep: Number((60 / estimatedBpm).toFixed(2)),
    waveform,
    beats
  };
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

  return `Plik ${audioAnalysis.fileName}: długość ${audioAnalysis.duration}s, szacunkowe BPM ${audioAnalysis.bpm}.`;
}
