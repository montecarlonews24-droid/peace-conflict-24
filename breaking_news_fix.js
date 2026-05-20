// Block breaking news older than 24 hours
const _origBreaking = window.showBreaking;
window.showBreaking = function(text, dur) {
  if (!text) return;
  const key = 'bn_' + btoa(unescape(encodeURIComponent(text))).slice(0, 20);
  const now = Date.now();
  const saved = localStorage.getItem(key);
  if (saved && (now - parseInt(saved)) < 86400000) return; // skip if < 24h
  localStorage.setItem(key, now);
  if (typeof _origBreaking === 'function') _origBreaking(text, dur);
};

// Also override seedInitialAlerts to skip old hardcoded headlines
window.seedInitialAlerts = function() {
  let attempts = 0;
  const iv = setInterval(() => {
    attempts++;
    const live = typeof getActiveHeadlines === 'function'
      ? getActiveHeadlines().filter(h => h.src && h.src !== '')
      : [];
    if (live.length > 0 || attempts > 20) {
      clearInterval(iv);
      if (live.length === 0) return;
      const seen = typeof shownBreaking !== 'undefined' ? shownBreaking : new Set();
      const unseen = live.filter(h => !seen.has(h.text));
      const keywords = ['nuclear','war','invasion','airstrike','missile','attack','siege'];
      const pick = unseen.find(h => keywords.some(k => h.text.toLowerCase().includes(k)))
        || (unseen.length > 0 ? unseen[0] : null);
      if (pick) setTimeout(() => window.showBreaking(pick.text, 9000), 3500);
    }
  }, 800);
};
