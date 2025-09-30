// src/analytics/beacons.js
let installed = false;

function postJSON(url, payload, useBeacon = false) {
  const pathname = window.location?.pathname;
  const body = JSON.stringify({ ...payload, path: pathname });

  if (useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return Promise.resolve(true);
    } catch (_) { /* fall through to fetch */ }
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: useBeacon, // helps on page unload
    body,
  }).catch(() => {});
}

export function initAnalyticsBeacons() {
  if (installed) return;
  installed = true;

  // --- page load performance ---
  // On next tick after load, record navigation timing if available
  const sendLoad = () => {
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0];
      const loadTimeMs = nav ? Math.round(nav.duration) : Math.round(performance.now());
      postJSON('/api/analytics/load-time', { loadTimeMs });
    } catch (_) {}
  };
  if (document.readyState === 'complete') {
    setTimeout(sendLoad, 0);
  } else {
    window.addEventListener('load', () => setTimeout(sendLoad, 0), { once: true });
  }

  // --- session duration ---
  const sessionStart = Date.now();
  const sendSessionEnd = () => {
    const sec = Math.max(0, Math.round((Date.now() - sessionStart) / 1000));
    postJSON('/api/analytics/session-end', { sessionSec: sec }, true);
  };
  // send when page is hidden or being unloaded
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendSessionEnd();
  });
  window.addEventListener('pagehide', sendSessionEnd);

  // --- client errors ---
  let errorCount = 0;
  const sendError = (payload) => {
    if (errorCount >= 3) return; // avoid flooding
    errorCount += 1;
    postJSON('/api/analytics/error', payload, true);
  };

  window.addEventListener('error', (e) => {
    const name = e.error?.name || 'Error';
    const message = e.message || String(e.error || 'Unknown error');
    const stack = e.error?.stack ? String(e.error.stack).slice(0, 1000) : null;
    sendError({ name, message, stack });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const name = (reason && reason.name) || 'UnhandledRejection';
    const message = reason?.message || String(reason);
    const stack = reason?.stack ? String(reason.stack).slice(0, 1000) : null;
    sendError({ name, message, stack });
  });
}
