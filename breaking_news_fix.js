// ═══════════════════════════════════════════════════════════════════════
// PEACE & CONFLICT 24 — BREAKING NEWS FIX
// أضف هذا الكود قبل </body> في ملف index.html مباشرة
// ═══════════════════════════════════════════════════════════════════════

(function applyBreakingNewsFix() {

  // ── 1. Restore seen headlines from localStorage ──
  try {
    const stored = JSON.parse(localStorage.getItem('pc24_shown_breaking') || '[]');
    if (typeof shownBreaking !== 'undefined') {
      stored.forEach(h => shownBreaking.add(h));
    }
  } catch(e) {}

  // ── 2. Wrap showBreaking to persist seen items ──
  const _origShowBreaking = window.showBreaking;
  window.showBreaking = function(text, duration) {
    if (typeof shownBreaking !== 'undefined') {
      shownBreaking.add(text);
      try {
        localStorage.setItem('pc24_shown_breaking',
          JSON.stringify([...shownBreaking].slice(-30)));
      } catch(e) {}
    }
    if (typeof _origShowBreaking === 'function') _origShowBreaking(text, duration);
  };

  // ── 3. Replace seedInitialAlerts with RSS-based version ──
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

        // Prefer critical/high keywords
        const keywords = {
          critical: ['nuclear','warhead','world war','declare war','capital seized','coup','genocide','chemical weapon'],
          high: ['attack','offensive','airstrike','invasion','siege','ceasefire collapse','missile strike','naval blockade']
        };

        let pick = unseen.find(h => {
          const t = h.text.toLowerCase();
          return keywords.critical.some(k => t.includes(k));
        }) || unseen.find(h => {
          const t = h.text.toLowerCase();
          return keywords.high.some(k => t.includes(k));
        }) || (unseen.length > 0
          ? unseen[Math.floor(Math.random() * Math.min(8, unseen.length))]
          : null);

        if (pick) {
          setTimeout(() => window.showBreaking(pick.text, 9000), 3500);
        }

        // Schedule rotation every 8 minutes
        setInterval(() => {
          const current = typeof getActiveHeadlines === 'function' ? getActiveHeadlines() : [];
          const fresh = current.filter(h => h.text && !seen.has(h.text));
          if (fresh.length > 0) {
            const next = fresh[Math.floor(Math.random() * Math.min(5, fresh.length))];
            window.showBreaking(next.text, 8000);
          }
        }, 8 * 60 * 1000);
      }
    }, 800);
  };

  // ── 4. Override DOMContentLoaded static breaking news ──
  // Cancel the old static setTimeout by running our fix after page load
  window.addEventListener('load', function() {
    // Re-run seedInitialAlerts after RSS might have loaded
    setTimeout(() => {
      if (typeof getActiveHeadlines === 'function') {
        const live = getActiveHeadlines().filter(h => h.src && h.src !== '');
        if (live.length > 0) {
          const seen = typeof shownBreaking !== 'undefined' ? shownBreaking : new Set();
          const unseen = live.filter(h => !seen.has(h.text));
          if (unseen.length > 0) {
            const pick = unseen[0];
            window.showBreaking(pick.text, 8000);
          }
        }
      }
    }, 5000);
  });

  console.log('[P&C24] Breaking news fix applied ✅');

})();
