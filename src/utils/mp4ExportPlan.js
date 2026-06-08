import { buildFfmpegVirtualFilePlan, buildImageSequenceMp4Command, buildImageSequenceMp4WithAudioCommand, commandToShellString } from './ffmpegCommandBuilder.js';
import { validateFrameSequence } from './frameSequenceValidation.js';

export function buildMp4ExportPlan({ sequence, audioFile = null, profileId = 'mp4-poc' }) {
  const validation = validateFrameSequence(sequence);
  const hasAudio = Boolean(audioFile);
  const virtualFilePlan = validation.valid ? buildFfmpegVirtualFilePlan(sequence) : null;
  const command = buildMp4Command({ sequence, validation, hasAudio });

  return {
    schema: 'fotobeat.mp4-export-plan.v1',
    createdAt: new Date().toISOString(),
    profileId,
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
  return `Plan MP4 gotowy: ${plan.virtualFilePlan.frameCount} klatek${plan.hasAudio ? ' + audio' : ' bez audio'}, komenda ffmpeg przygotowana.`;
}

function buildMp4Command({ sequence, validation, hasAudio }) {
  if (!validation.valid) return [];

  const base = {
    fps: sequence.fps,
    width: sequence.width,
    height: sequence.height,
    inputPattern: 'frames/frame_%04d.png',
    outputName: 'fotobeat-output.mp4',
    crf: 23,
    preset: 'veryfast'
  };

  if (!hasAudio) return buildImageSequenceMp4Command(base);

  return buildImageSequenceMp4WithAudioCommand({
    ...base,
    audioName: 'audio.input',
    duration: sequence.seconds
  });
}
