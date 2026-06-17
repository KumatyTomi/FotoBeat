import { resolveMediaForClip } from './mediaScoring.js';

export function findClipAtTime(clips, time) {
  return [...clips].reverse().find((clip) => time >= clip.start) ?? clips[0];
}

export function renderFrameAtTime(canvas, {
  time,
  timeline,
  selectedFormat,
  selectedPreset,
  selectedMediaAssets,
  pinnedAssetsByClip,
  projectName
}) {
  const totalDuration = Math.max(timeline.estimatedDuration || 1, 1);
  const normalizedTime = normalizeFrameTime(time, totalDuration);
  const clip = findClipAtTime(timeline.clips, normalizedTime);
  const clipIndex = Math.max(1, timeline.clips.indexOf(clip) + 1);
  const mediaAsset = resolveMediaForClip(clipIndex, selectedMediaAssets, pinnedAssetsByClip);

  drawRenderPreview(canvas, {
    time: normalizedTime,
    clip,
    clipIndex,
    totalClips: timeline.clips.length,
    format: selectedFormat,
    preset: selectedPreset,
    imageCount: selectedMediaAssets.length,
    mediaAsset,
    projectName
  });

  return { time: Number(normalizedTime.toFixed(3)), clip, clipIndex, totalClips: timeline.clips.length, mediaAssetId: mediaAsset?.id ?? null, mediaAssetName: mediaAsset?.name ?? null };
}

export function normalizeFrameTime(time, totalDuration) {
  if (!Number.isFinite(time) || time < 0) return 0;
  if (!Number.isFinite(totalDuration) || totalDuration <= 0) return 0;
  return time % totalDuration;
}

export function drawRenderPreview(canvas, { time, clip, clipIndex, totalClips, format, preset, imageCount, mediaAsset, projectName }) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const progress = getClipProgress(clip, time);
  const pulse = Math.sin(progress * Math.PI);
  const energy = clip?.energy ?? 0.5;
  const colors = getPresetColors(preset.id);

  ctx.clearRect(0, 0, width, height);
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, preset.id === 'vairaChrono' ? '#070604' : '#05050a');
  background.addColorStop(0.45, colors.deep);
  background.addColorStop(1, preset.id === 'vairaChrono' ? '#04070a' : '#10101f');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  drawGlow(ctx, width * (0.28 + pulse * 0.12), height * 0.22, width * 0.38, colors.primary, 0.45 + energy * 0.28);
  drawGlow(ctx, width * (0.74 - pulse * 0.08), height * 0.76, width * 0.44, colors.secondary, 0.25 + energy * 0.22);
  if (preset.id === 'vairaChrono') drawChronoDial(ctx, width, height, progress, energy, colors);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(getPresetRotation(preset.id, progress, energy));
  ctx.scale(1 + pulse * 0.035 + energy * 0.018, 1 + pulse * 0.035 + energy * 0.018);
  drawFrameStack(ctx, width, height, colors, clipIndex, imageCount, mediaAsset);
  ctx.restore();

  drawScanlines(ctx, width, height, preset.id, progress);
  drawPreviewText(ctx, width, height, { projectName, clip, clipIndex, totalClips, preset, format, colors, mediaAsset });
}

function getClipProgress(clip, time) {
  if (!clip) return 0;
  return Math.min(1, Math.max(0, (time - clip.start) / Math.max(clip.duration, 0.1)));
}

function getPresetColors(presetId) {
  const map = {
    neonPulse: { primary: '#00d3ff', secondary: '#7c3cff', deep: '#10103a' },
    smokeCut: { primary: '#c8d0ff', secondary: '#6d7188', deep: '#171927' },
    matrixGlitch: { primary: '#6cff8d', secondary: '#00d3ff', deep: '#061b13' },
    sinCity: { primary: '#ff3b5c', secondary: '#f4f4f4', deep: '#17080c' },
    spiralZoom: { primary: '#ffb86b', secondary: '#7c3cff', deep: '#1c102f' },
    dreamFade: { primary: '#ffd6f2', secondary: '#8be9ff', deep: '#171429' },
    vairaChrono: { primary: '#f7c66a', secondary: '#60f5ff', deep: '#151109' }
  };
  return map[presetId] ?? map.neonPulse;
}

function getPresetRotation(presetId, progress, energy) {
  if (presetId === 'spiralZoom') return progress * 0.16;
  if (presetId === 'matrixGlitch') return Math.sin(progress * 24) * 0.006 * energy;
  if (presetId === 'dreamFade') return Math.sin(progress * Math.PI) * 0.01;
  if (presetId === 'vairaChrono') return Math.round(progress * 24) * 0.0018 * energy;
  return Math.sin(progress * Math.PI * 2) * 0.018 * energy;
}

function drawGlow(ctx, x, y, radius, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawChronoDial(ctx, width, height, progress, energy, colors) {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.38;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = hexToRgba(colors.primary, 0.28 + energy * 0.12);
  ctx.lineWidth = Math.max(2, width * 0.0014);
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.62 + ring * 0.18), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let tick = 0; tick < 60; tick += 1) {
    const angle = (tick / 60) * Math.PI * 2 + progress * 0.12;
    const inner = radius * (tick % 5 === 0 ? 0.76 : 0.84);
    const outer = radius * 0.92;
    ctx.strokeStyle = tick % 5 === 0 ? hexToRgba(colors.primary, 0.55) : hexToRgba(colors.secondary, 0.18);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.rotate(progress * Math.PI * 2);
  ctx.strokeStyle = hexToRgba(colors.primary, 0.78);
  ctx.lineWidth = Math.max(3, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius * 0.52, 0);
  ctx.stroke();
  ctx.restore();
}

function drawFrameStack(ctx, width, height, colors, clipIndex, imageCount, mediaAsset) {
  const baseWidth = width * 0.58;
  const baseHeight = height * 0.58;
  for (let index = 4; index >= 0; index -= 1) {
    const offset = (index - 2) * width * 0.025;
    const alpha = 0.18 + (5 - index) * 0.08;
    ctx.fillStyle = index % 2 === 0 ? hexToRgba(colors.primary, alpha) : hexToRgba(colors.secondary, alpha);
    ctx.strokeStyle = hexToRgba('#ffffff', 0.16 + alpha * 0.22);
    ctx.lineWidth = Math.max(2, width * 0.002);
    roundRect(ctx, -baseWidth / 2 + offset, -baseHeight / 2, baseWidth, baseHeight, width * 0.025);
    ctx.fill();
    ctx.stroke();
  }
  const heroWidth = baseWidth * 0.92;
  const heroHeight = baseHeight * 0.92;
  const heroX = -heroWidth / 2;
  const heroY = -heroHeight / 2;
  if (mediaAsset?.status === 'ready' && mediaAsset.image) {
    drawImageCover(ctx, mediaAsset.image, heroX, heroY, heroWidth, heroHeight, width * 0.022);
    ctx.fillStyle = hexToRgba(colors.deep, 0.18);
    roundRect(ctx, heroX, heroY, heroWidth, heroHeight, width * 0.022);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = `700 ${Math.max(26, width * 0.028)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(imageCount ? `PHOTO ${clipIndex}` : 'DROP PHOTOS', 0, 0);
  }
}

function drawImageCover(ctx, image, x, y, width, height, radius) {
  const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawScanlines(ctx, width, height, presetId, progress) {
  if (presetId !== 'matrixGlitch' && presetId !== 'sinCity' && presetId !== 'vairaChrono') return;
  ctx.save();
  ctx.globalAlpha = presetId === 'matrixGlitch' ? 0.18 : presetId === 'vairaChrono' ? 0.06 : 0.08;
  ctx.strokeStyle = presetId === 'vairaChrono' ? '#f7c66a' : '#ffffff';
  ctx.lineWidth = 1;
  const gap = Math.max(12, height * 0.012);
  const shift = progress * gap * 2;
  for (let y = -gap; y < height + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y + shift);
    ctx.lineTo(width, y + shift);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPreviewText(ctx, width, height, { projectName, clip, clipIndex, totalClips, preset, format, colors, mediaAsset }) {
  const margin = width * 0.06;
  const bottom = height - margin;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = `800 ${Math.max(24, width * 0.025)}px Inter, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(projectName || 'FotoBeat Project', margin, margin * 1.25);
  ctx.fillStyle = hexToRgba(colors.primary, 0.92);
  ctx.font = `900 ${Math.max(16, width * 0.014)}px Inter, sans-serif`;
  ctx.fillText(`${preset.name} · ${format.label}`, margin, margin * 1.75);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.font = `700 ${Math.max(18, width * 0.017)}px Inter, sans-serif`;
  ctx.fillText(`Clip ${clipIndex}/${totalClips} · ${clip?.section ?? 'intro'} · ${clip?.effect ?? 'fade'}`, margin, bottom);
  if (mediaAsset?.name) {
    ctx.font = `500 ${Math.max(15, width * 0.013)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    ctx.fillText(mediaAsset.name.slice(0, 42), margin, bottom - margin * 0.42);
  }
  ctx.textAlign = 'right';
  ctx.fillText('FotoBeat.me', width - margin, bottom);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
