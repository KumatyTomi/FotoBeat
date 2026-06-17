# @fotobeat/common

This package contains common types and contract definitions shared between the **FotoBeat Desktop** and **FotoBeat SaaS** projects. Maintaining a central module for shared definitions helps avoid drift between repositories and ensures that both products agree on the shape of the manifest and other core contracts.

## Contents

- `manifest.d.ts` – TypeScript declarations for the project manifest used by both applications. The `FotoBeatManifest` describes the version, media list (images and audio), beat information and render settings.

## Usage

Import the manifest types in TypeScript projects to validate or generate manifest files:

```ts
import type { FotoBeatManifest } from '@fotobeat/common/manifest';

const manifest: FotoBeatManifest = {
  version: '1.0',
  media: {
    images: ['photo1.jpg', 'photo2.jpg'],
    audio: 'song.mp3',
  },
  beat: 120,
  renderSettings: {
    // custom settings
  },
};
```

When updating the manifest schema, please bump the `version` property and update the type definitions here. Then update implementations in both the Desktop and SaaS repositories.
