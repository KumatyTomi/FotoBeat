export interface FotoBeatMedia {
  images: string[];
  audio: string;
}

export interface RenderSettings {
  [key: string]: any;
}

/**
 * FotoBeatManifest defines the contract for projects used by FotoBeat Desktop and FotoBeat SaaS.
 * Keep this contract synchronized across repositories.
 */
export interface FotoBeatManifest {
  /** Version of the manifest schema */
  version: string;
  /** List of media files (image paths and audio file) */
  media: FotoBeatMedia;
  /** Beats per minute (BPM) or beat interval for syncing effects */
  beat: number;
  /** Arbitrary render settings which can be extended in the future */
  renderSettings: RenderSettings;
}
