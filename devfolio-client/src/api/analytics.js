// src/api/analytics.js (replace only this function)
export function recordResumeClick() {
  try {
    const payload = JSON.stringify({ path: window.location?.pathname || '/' });

    // Best: sendBeacon survives page navigation/unload
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/resume-click', blob);
      return; // no need to await
    }

    // Fallback: fetch with keepalive to avoid abort on unload
    fetch('/api/analytics/resume-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    console.error('recordResumeClick failed:', e);
  }
}
