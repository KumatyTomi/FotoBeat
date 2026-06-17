test('resolves Auto MP4 profile from sequence proportions', async () => {
  const { getResolvedMp4Profile } = await import('../src/utils/mp4ProfileSelection.js');

  expect(getResolvedMp4Profile({
    profileId: 'auto',
    sequence: { width: 1080, height: 1920 }
  })).toMatchObject({ id: 'mp4-mobile-vertical', width: 1080, height: 1920 });

  expect(getResolvedMp4Profile({
    profileId: 'auto',
    sequence: { width: 1920, height: 1080 }
  })).toMatchObject({ id: 'mp4-wide-hd', width: 1920, height: 1080 });

  expect(getResolvedMp4Profile({
    profileId: 'auto',
    sequence: { width: 1080, height: 1080 }
  })).toMatchObject({ id: 'mp4-square-social', width: 1080, height: 1080 });
});

test('resolves audio POC when the stored POC profile is used with audio', async () => {
  const { getResolvedMp4Profile } = await import('../src/utils/mp4ProfileSelection.js');

  expect(getResolvedMp4Profile({
    profileId: 'mp4-poc',
    sequence: { width: 1080, height: 1920 },
    includeAudio: true
  })).toMatchObject({ id: 'mp4-audio-poc', audioBitrate: '160k' });
});
