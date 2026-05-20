(function applyBreakingNewsFix() {

  // ── 1. Load seen headlines from localStorage immediately ──
  try {
    const stored = JSON.parse(localStorage.getItem('pc24_shown_breaking') || '[]');
    if (typeof shownBreaking !== 'undefined') {
      stored.forEach(h => shownBreaking.add(h));
    }
  } catch(e) {}

  // ── 2. Wrap showBreaking — BLOCK if already shown ──
  const _orig = window.showBreaking;
  window.showBreaking = function(text, duration) {
    if (typeof shownBreaking !== 'undefined') {
      if (shownBreaking.has(text)) return; // ← المنع هنا
      shownBreaking.add(text);
      try {
        localStorage.setItem('pc24_shown_breaking',
          JSON.stringify([...shownBreaking].slice(-30)));
      } catch(e) {}
    }
    if (typeof _orig === 'function') _orig(text, duration);
  };

  // ── 3. Replace seedInitialAlerts with RSS-based ──
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
        const pick = unseen.find(h => {
          const t = h.text.toLowerCase();
          return keywords.some(k => t.includes(k));
        }) || (unseen.length > 0 ? unseen[0] : null);
        if (pick) setTimeout(() => window.showBreaking(pick.text, 9000), 3500);
        setInterval(() => {
          const fresh = (typeof getActiveHeadlines==='function' ? getActiveHeadlines() : [])
            .filter(h => h.text && !seen.has(h.text));
          if (fresh.length > 0) window.showBreaking(fresh[0].text, 8000);
        }, 8 * 60 * 1000);
      }
    }, 800);
  };

  console.log('[P&C24] Breaking news fix v2 applied ✅');
})();
