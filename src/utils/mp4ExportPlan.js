import { buildFfmpegVirtualFilePlan, buildImageSequenceMp4Command, commandToShellString } from './ffmpegCommandBuilder.js';
import { validateFrameSequence } from './frameSequenceValidation.js';

export function buildMp4ExportPlan({ sequence, profileId = 'mp4-poc-no-audio' }) {
  const validation = validateFrameSequence(sequence);
  const virtualFilePlan = validation.valid ? buildFfmpegVirtualFilePlan(sequence) : null;
  const command = validation.valid ? buildImageSequenceMp4Command({
    fps: sequence.fps,
    width: sequence.width,
    height: sequence.height,
    inputPattern: 'frames/frame_%04d.png',
    outputName: 'fotobeat-output.mp4',
    crf: 23,
    preset: 'veryfast'
  }) : [];

  return {
    schema: 'fotobeat.mp4-export-plan.v1',
    createdAt: new Date().toISOString(),
    profileId,
    sequenceId: sequence?.id ?? '',
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
  return `Plan MP4 gotowy: ${plan.virtualFilePlan.frameCount} klatek, komenda ffmpeg przygotowana.`;
}
