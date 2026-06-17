import { useEffect, useRef, useState } from 'react';
import { buildFrameSequenceZipEntries, buildStoredZip } from '../utils/zipExport.js';
import { safeFilename } from '../utils/projectExport.js';

export function useFrameSequenceZipExporter() {
  const objectUrlsRef = useRef(new Set());
  const [zipState, setZipState] = useState({
    status: 'idle',
    message: 'Gotowe do spakowania sekwencji klatek PNG.',
    sequenceId: '',
    downloadUrl: '',
    fileName: '',
    size: 0
  });

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  async function exportSequenceZip(sequence) {
    if (!sequence?.frames?.length) {
      setZipState({
        status: 'error',
        message: 'Brak klatek do spakowania.',
        sequenceId: sequence?.id ?? '',
        downloadUrl: '',
        fileName: '',
        size: 0
      });
      return;
    }

    setZipState({
      status: 'building',
      message: `Pakuję ${sequence.frames.length} klatek PNG do ZIP...`,
      sequenceId: sequence.id,
      downloadUrl: '',
      fileName: '',
      size: 0
    });

    try {
      const entries = buildFrameSequenceZipEntries(sequence);
      const blob = await buildStoredZip(entries);
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `${safeFilename(sequence.projectName)}-frames-${sequence.id}.zip`;

      objectUrlsRef.current.add(downloadUrl);
      setZipState({
        status: 'ready',
        message: `ZIP gotowy: ${fileName}.`,
        sequenceId: sequence.id,
        downloadUrl,
        fileName,
        size: blob.size
      });
    } catch (error) {
      setZipState({
        status: 'error',
        message: error.message || 'Nie udało się spakować sekwencji PNG.',
        sequenceId: sequence.id,
        downloadUrl: '',
        fileName: '',
        size: 0
      });
    }
  }

  function clearZipExport() {
    if (zipState.downloadUrl) {
      URL.revokeObjectURL(zipState.downloadUrl);
      objectUrlsRef.current.delete(zipState.downloadUrl);
    }

    setZipState({
      status: 'idle',
      message: 'Gotowe do spakowania sekwencji klatek PNG.',
      sequenceId: '',
      downloadUrl: '',
      fileName: '',
      size: 0
    });
  }

  return {
    zipState,
    exportSequenceZip,
    clearZipExport
  };
}
