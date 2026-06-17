import { getRenderProfile } from '../data/renderProfiles.js';
import { buildFfmpegVirtualFilePlan, buildImageSequenceMp4Command, buildImageSequenceMp4WithAudioCommand, commandToShellString } from './ffmpegCommandBuilder.js';
import { validateFrameSequence } from './frameSequenceValidation.js';

export function buildMp4ExportPlan({ sequence, audioFile = null, profileId = 'mp4-poc' }) {
  const profile = getRenderProfile(profileId);
  const validation = validateFrameSequence(sequence, {
    maxDuration: profile.maxDuration,
    maxFps: profile.fps,
    maxFrameCount: profile.maxFrameCount,
    width: profile.width,
    height: profile.height
  });
  const hasAudio = Boolean(audioFile);
  const virtualFilePlan = validation.valid ? buildFfmpegVirtualFilePlan(sequence) : null;
  const command = buildMp4Command({ sequence, validation, hasAudio, profile });

  return {
    schema: 'fotobeat.mp4-export-plan.v1',
    createdAt: new Date().toISOString(),
    profileId: profile.id,
    profile: {
      id: profile.id,
      label: profile.label,
      quality: profile.quality,
      target: profile.target,
      container: profile.container,
      codec: profile.codec,
      width: profile.width ?? sequence?.width ?? 0,
      height: profile.height ?? sequence?.height ?? 0,
      fps: profile.fps,
      crf: profile.crf,
      preset: profile.preset,
      maxDuration: profile.maxDuration,
      maxFrameCount: profile.maxFrameCount
    },
    sequenceId: sequence?.id ?? '',
    hasAudio,
    audioName: hasAudio ? audioFile.name : '',
    validation,
    virtualFilePlan,
    command,
    shellCommand: command.length ? commandToShellString(command) : '',
    status: validation.valid ? 'ready-for-ffmpeg-wasm' : 'blocked'
  };
}

export function explainMp4ExportPlan(plan) {
  if (!plan) return 'Brak planu eksportu MP4.';
  if (plan.status === 'blocked') return plan.validation.summary;
  return `Plan ${plan.profile?.label ?? 'MP4'} gotowy: ${plan.virtualFilePlan.frameCount} klatek${plan.hasAudio ? ' + audio' : ' bez audio'}, ${plan.profile?.width}x${plan.profile?.height}, CRF ${plan.profile?.crf}.`;
}

function buildMp4Command({ sequence, validation, hasAudio, profile }) {
  if (!validation.valid) return [];

  const base = {
    fps: Math.min(sequence.fps, profile.fps ?? sequence.fps),
    width: profile.width ?? sequence.width,
    height: profile.height ?? sequence.height,
    inputPattern: 'frames/frame_%04d.png',
    outputName: 'fotobeat-output.mp4',
    crf: profile.crf ?? 23,
    preset: profile.preset ?? 'veryfast'
  };

  if (!hasAudio) return buildImageSequenceMp4Command(base);

  return buildImageSequenceMp4WithAudioCommand({
    ...base,
    audioName: 'audio.input',
    audioBitrate: profile.audioBitrate ?? '192k',
    duration: sequence.seconds
  });
}
