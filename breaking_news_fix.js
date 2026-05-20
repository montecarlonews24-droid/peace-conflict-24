// Override seedInitialAlerts before it runs
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
      if (pick) setTimeout(() => showBreaking(pick.text, 9000), 3500);
    }
  }, 800);
};

// Block static breaking news banner
const _orig = window.showBreaking;
const BLOCKED = ['Iran / US-Israel War — Risk Level', 'Breaking: North Korea', 'Breaking: Lebanon'];
window.showBreaking = function(text, dur) {
  if (!text) return;
  if (BLOCKED.some(b => text.includes(b))) return;
  if (typeof _orig === 'function') _orig(text, dur);
};
