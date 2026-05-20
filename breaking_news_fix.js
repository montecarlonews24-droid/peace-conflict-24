(function applyBreakingNewsFix() {

  // ── 1. Blocked headlines — never show these static ones ──
  const BLOCKED = [
    'Iran / US-Israel War — Risk Level 95/100 CRITICAL',
    'Breaking: North Korea ICBM',
    'Breaking: Lebanon / Hezbollah',
  ];

  // ── 2. Load seen headlines from localStorage ──
  try {
    const stored = JSON.parse(localStorage.getItem('pc24_shown_breaking') || '[]');
    if (typeof shownBreaking !== 'undefined') {
      stored.forEach(h => shownBreaking.add(h));
      BLOCKED.forEach(h => shownBreaking.add(h)); // block static ones
    }
  } catch(e) {}

  // Also add blocked to shownBreaking directly
  if (typeof shownBreaking !== 'undefined') {
    BLOCKED.forEach(h => shownBreaking.add(h));
  }

  // ── 3. Wrap showBreaking — BLOCK if already shown or blocked ──
  const _orig = window.showBreaking;
  window.showBreaking = function(text, duration) {
    // Block static headlines and already-shown ones
    const isBlocked = BLOCKED.some(b => text && text.includes(b.slice(0, 20)));
    if (isBlocked) return;
    if (typeof shownBreaking !== 'undefined' && shownBreaking.has(text)) return;

    if (typeof shownBreaking !== 'undefined') {
      shownBreaking.add(text);
      try {
        localStorage.setItem('pc24_shown_breaking',
          JSON.stringify([...shownBreaking].slice(-30)));
      } catch(e) {}
    }
    if (typeof _orig === 'function') _orig(text, duration);
  };

  // ── 4. Replace seedInitialAlerts with RSS-based ──
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
        const unseen = live.filter(h => !seen.has(h.text) &&
          !BLOCKED.some(b => h.text && h.text.includes(b.slice(0,20))));
        const keywords = ['nuclear','war','invasion','airstrike','missile','attack','siege'];
        const pick = unseen.find(h => {
          const t = h.text.toLowerCase();
          return keywords.some(k => t.includes(k));
        }) || (unseen.length > 0 ? unseen[0] : null);
        if (pick) setTimeout(() => window.showBreaking(pick.text, 9000), 3500);
        setInterval(() => {
          const fresh = (typeof getActiveHeadlines==='function' ? getActiveHeadlines() : [])
            .filter(h => h.text && !seen.has(h.text) &&
              !BLOCKED.some(b => h.text.includes(b.slice(0,20))));
          if (fresh.length > 0) window.showBreaking(fresh[0].text, 8000);
        }, 8 * 60 * 1000);
      }
    }, 800);
  };

  console.log('[P&C24] Breaking news fix v3 ✅');
})();
