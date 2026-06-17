import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const contractPairs = [
  {
    name: 'project',
    schemaPath: 'contracts/fotobeat.project.v1.schema.json',
    examplePath: 'contracts/examples/project.valid.json',
    customValidate: validateProjectContract
  },
  {
    name: 'render',
    schemaPath: 'contracts/fotobeat.render.v1.schema.json',
    examplePath: 'contracts/examples/render.valid.json',
    customValidate: validateRenderContract
  },
  {
    name: 'desktop-render-plan',
    schemaPath: 'contracts/fotobeat.desktop.render-plan.v1.schema.json',
    examplePath: 'contracts/examples/desktop-render-plan.valid.json',
    customValidate: validateDesktopRenderPlanContract
  },
  {
    name: 'preset',
    schemaPath: 'contracts/fotobeat.preset.v1.schema.json',
    examplePath: 'contracts/examples/preset.valid.json',
    customValidate: validatePresetContract
  }
];

const allErrors = [];

for (const pair of contractPairs) {
  const schema = readJson(pair.schemaPath);
  const example = readJson(pair.examplePath);
  const errors = [
    ...validateJsonSchemaSubset(example, schema, schema, pair.name),
    ...pair.customValidate(example)
  ];

  if (errors.length > 0) {
    allErrors.push(...errors.map((error) => `${pair.name}: ${error}`));
  } else {
    console.log(`ok ${pair.name} contract`);
  }
}

if (allErrors.length > 0) {
  console.error('\nContract validation failed:');
  allErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('All FotoBeat contracts are valid.');

function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function validateJsonSchemaSubset(value, schema, rootSchema, location) {
  const errors = [];

  if (!schema || typeof schema !== 'object') return errors;

  if (schema.$ref) {
    return validateJsonSchemaSubset(value, resolveRef(schema.$ref, rootSchema), rootSchema, location);
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter((candidate) => validateJsonSchemaSubset(value, candidate, rootSchema, location).length === 0);
    if (matches.length !== 1) {
      errors.push(`${location} must match exactly one oneOf schema, matched ${matches.length}`);
    }
    return errors;
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'const') && value !== schema.const) {
    errors.push(`${location} must equal ${JSON.stringify(schema.const)}`);
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${location} must be ${Array.isArray(schema.type) ? schema.type.join(' or ') : schema.type}`);
    return errors;
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${location} must be one of ${schema.enum.join(', ')}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${location} is shorter than ${schema.minLength}`);
    if (schema.maxLength && value.length > schema.maxLength) errors.push(`${location} is longer than ${schema.maxLength}`);
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) errors.push(`${location} must be >= ${schema.minimum}`);
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) errors.push(`${location} must be > ${schema.exclusiveMinimum}`);
    if (typeof schema.maximum === 'number' && value > schema.maximum) errors.push(`${location} must be <= ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${location} must contain at least ${schema.minItems} items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${location} must contain unique items`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateJsonSchemaSubset(item, schema.items, rootSchema, `${location}[${index}]`));
      });
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${location}.${key} is required`);
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(...validateJsonSchemaSubset(value[key], propertySchema, rootSchema, `${location}.${key}`));
      }
    }
  }

  return errors;
}

function resolveRef(ref, rootSchema) {
  if (!ref.startsWith('#/$defs/')) throw new Error(`Unsupported schema ref: ${ref}`);
  const key = ref.slice('#/$defs/'.length);
  const resolved = rootSchema.$defs?.[key];
  if (!resolved) throw new Error(`Missing schema definition: ${ref}`);
  return resolved;
}

function matchesType(value, type) {
  const types = Array.isArray(type) ? type : [type];
  return types.some((candidate) => {
    if (candidate === 'array') return Array.isArray(value);
    if (candidate === 'integer') return Number.isInteger(value);
    if (candidate === 'number') return typeof value === 'number' && Number.isFinite(value);
    if (candidate === 'null') return value === null;
    if (candidate === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
    return typeof value === candidate;
  });
}

function validateProjectContract(project) {
  const errors = [];
  const assetMap = new Map((project.media?.assets ?? []).map((asset) => [asset.id, asset]));
  const seenFingerprints = new Set();

  for (const asset of project.media?.assets ?? []) {
    if (seenFingerprints.has(asset.fingerprint)) errors.push(`duplicate media fingerprint: ${asset.fingerprint}`);
    seenFingerprints.add(asset.fingerprint);
  }

  for (const clip of project.timeline?.clips ?? []) {
    const asset = assetMap.get(clip.assetId);
    if (!asset) errors.push(`timeline clip ${clip.id} references missing asset ${clip.assetId}`);
    if (asset && asset.type !== 'image') errors.push(`timeline clip ${clip.id} must reference an image asset`);
    if (clip.start + clip.duration > project.timeline.durationSeconds + 0.001) {
      errors.push(`timeline clip ${clip.id} exceeds project duration`);
    }
  }

  return errors;
}

function validateRenderContract(render) {
  const errors = [];
  const assetMap = new Map((render.assets ?? []).map((asset) => [asset.id, asset]));

  if (assetMap.size !== (render.assets ?? []).length) errors.push('render assets must have unique ids');

  for (const clip of render.timeline ?? []) {
    const asset = assetMap.get(clip.assetId);
    if (!asset) errors.push(`render clip ${clip.id} references missing asset ${clip.assetId}`);
    if (asset && asset.type !== 'image') errors.push(`render clip ${clip.id} must reference an image asset`);
    if (clip.start + clip.duration > render.output.durationSeconds + 0.001) {
      errors.push(`render clip ${clip.id} exceeds output duration`);
    }
  }

  if (render.output.ratio === '9:16' && render.output.height <= render.output.width) errors.push('9:16 output must be portrait');
  if (render.output.ratio === '16:9' && render.output.width <= render.output.height) errors.push('16:9 output must be landscape');
  if (render.output.ratio === '1:1' && render.output.width !== render.output.height) errors.push('1:1 output must be square');

  return errors;
}

function validateDesktopRenderPlanContract(plan) {
  const errors = [];
  const args = plan.ffmpeg?.args ?? [];

  if (plan.inputMode === 'frame-sequence' && !plan.inputs?.sequence) {
    errors.push('frame-sequence plans must include inputs.sequence');
  }

  if (plan.inputMode === 'frame-sequence' && plan.inputs?.sequence?.expectedPattern && !args.includes(plan.inputs.sequence.expectedPattern)) {
    errors.push('ffmpeg args must reference inputs.sequence.expectedPattern');
  }

  if (plan.inputMode === 'frame-sequence' && args.at(-1) !== plan.output?.tempPath) {
    errors.push('ffmpeg args must write to output.tempPath as the final argument');
  }

  if (plan.output?.path === plan.output?.tempPath) {
    errors.push('output.path and output.tempPath must be different');
  }

  if (plan.output?.tempPath && !plan.output.tempPath.endsWith('.partial')) {
    errors.push('output.tempPath should use the .partial suffix');
  }

  if (plan.inputs?.audio?.imported && plan.output?.audioCodec !== 'aac') {
    errors.push('imported audio must produce AAC output');
  }

  if (!plan.inputs?.audio?.imported && plan.output?.audioCodec) {
    errors.push('audioCodec must be null when audio is not imported');
  }

  if (plan.renderProfile?.id && plan.output?.renderProfileId !== plan.renderProfile.id) {
    errors.push('output.renderProfileId must match renderProfile.id');
  }

  if (plan.renderProfile?.width && plan.format?.width !== plan.renderProfile.width) {
    errors.push('format.width must match renderProfile.width');
  }

  if (plan.renderProfile?.height && plan.format?.height !== plan.renderProfile.height) {
    errors.push('format.height must match renderProfile.height');
  }

  return errors;
}

function validatePresetContract(preset) {
  const errors = [];

  if (!preset.supportedFormats.includes('vertical')) {
    errors.push('preset must support vertical output for v1 MVP');
  }

  if (preset.effects.beatResponse > 0 && preset.effects.defaultEffectId.length === 0) {
    errors.push('beat-aware preset must define defaultEffectId');
  }

  return errors;
}
