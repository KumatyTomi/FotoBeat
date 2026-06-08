export async function getStorageHealth() {
  if (!navigator.storage?.estimate) {
    return {
      supported: false,
      usage: 0,
      quota: 0,
      usageRatio: 0,
      warningLevel: 'unknown',
      message: 'Storage estimate API nie jest wspierane w tej przeglądarce.'
    };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  const usageRatio = quota ? usage / quota : 0;

  return {
    supported: true,
    usage,
    quota,
    usageRatio: Number(usageRatio.toFixed(4)),
    warningLevel: getStorageWarningLevel(usageRatio),
    message: buildStorageMessage(usage, quota, usageRatio)
  };
}

export function formatStorageBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getStorageWarningLevel(usageRatio) {
  if (usageRatio >= 0.9) return 'critical';
  if (usageRatio >= 0.75) return 'warning';
  if (usageRatio >= 0.5) return 'notice';
  return 'ok';
}

function buildStorageMessage(usage, quota, usageRatio) {
  const percent = Math.round(usageRatio * 100);
  return `Użycie storage: ${formatStorageBytes(usage)} / ${formatStorageBytes(quota)} (${percent}%).`;
}
