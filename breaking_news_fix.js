// Block breaking news older than 24 hours
const _origBreaking = window.showBreaking;
window.showBreaking = function(text, dur) {
  if (!text) return;
  const key = 'bn_' + btoa(unescape(encodeURIComponent(text))).slice(0, 20);
  const now = Date.now();
  const saved = localStorage.getItem(key);
  if (saved && (now - parseInt(saved)) < 86400000) return;
  localStorage.setItem(key, now);
  if (typeof _origBreaking === 'function') _origBreaking(text, dur);
};

window.seedInitialAlerts = function() {
  let attempts = 0;
  const iv = setInterval(() => {
    attempts++;
    const live = typeof getActiveHeadlines === 'function'
      ? getActiveHeadlines().filter(h => h.src && h.src !== '') : [];
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

// ── ROOMS FIX ──
(function() {
  var roomMsgs = {};
  var roomDefaults = {
    'Global Analysis Hub':    [{u:'Atlas_77',t:'Tensions in Red Sea continue affecting global shipping.'},{u:'IntelWatcher',t:'Three diplomatic channels reportedly active in parallel.'}],
    'Diplomatic Solutions':   [{u:'PeaceKeeper',t:'Ceasefire negotiations entered third round with limited progress.'},{u:'Mediator9',t:'Both parties agreed to 72-hour humanitarian pause.'}],
    'Humanitarian Response':  [{u:'AidWorker',t:'Supply convoys delayed due to road access restrictions.'},{u:'ReliefOps',t:'UNHCR deployed additional resources to northern sector.'}],
    'Intelligence Briefing':  [{u:'SIGINT_Alpha',t:'Satellite imagery confirms troop repositioning in sector 7.'},{u:'GhostAnalyst',t:'Major announcement expected within 48 hours.'}],
  };

  function buildModal() {
    if (document.getElementById('_rm')) return;
    var d = document.createElement('div');
    d.id = '_rm';
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#040810;flex-direction:column;display:none';
    d.innerHTML =
      '<div style="background:rgba(8,15,30,.98);border-bottom:1px solid #1e3050;padding:10px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0">' +
        '<button id="_rmBack" style="background:none;border:none;color:#8fa8c8;font-size:26px;cursor:pointer">←</button>' +
        '<div style="flex:1"><div id="_rmTitle" style="font-family:Rajdhani,sans-serif;font-size:16px;font-weight:700;color:#fca311"></div>' +
        '<div id="_rmOnline" style="font-size:9px;color:#2dc653;font-family:monospace"></div></div>' +
        '<span style="font-size:9px;color:#2dc653">🔐 Encrypted</span>' +
      '</div>' +
      '<div id="_rmMsgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px"></div>' +
      '<div style="background:rgba(8,15,30,.98);border-top:1px solid #1e3050;padding:10px 12px 22px;display:flex;gap:8px;flex-shrink:0">' +
        '<input id="_rmInp" placeholder="Type a message..." style="flex:1;background:rgba(17,28,51,.8);border:1px solid #1e3050;border-radius:12px;padding:10px 14px;font-size:15px;color:#e8edf5;outline:none"/>' +
        '<button id="_rmSend" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#fca311,#f77f00);border:none;cursor:pointer;font-size:18px">➤</button>' +
      '</div>';
    document.body.appendChild(d);

    document.getElementById('_rmBack').onclick = function() {
      document.getElementById('_rm').style.display = 'none';
    };
    document.getElementById('_rmSend').onclick = _rmSend;
    document.getElementById('_rmInp').onkeydown = function(e) {
      if (e.key === 'Enter') _rmSend();
    };
  }

  function _rmSend() {
    var modal = document.getElementById('_rm');
    var inp = document.getElementById('_rmInp');
    if (!inp || !inp.value.trim() || !modal._rn) return;
    if (!roomMsgs[modal._rn]) roomMsgs[modal._rn] = [];
    roomMsgs[modal._rn].push({u:'You', t:inp.value.trim(), me:true});
    inp.value = '';
    renderRoom(modal._rn);
  }

  function renderRoom(name) {
    if (!roomMsgs[name]) roomMsgs[name] = (roomDefaults[name]||[]).map(function(x){return {u:x.u,t:x.t,me:false};});
    var el = document.getElementById('_rmMsgs');
    el.innerHTML = roomMsgs[name].map(function(m) {
      if (m.me) return '<div style="align-self:flex-end;max-width:82%"><div style="font-size:9px;color:#8fa8c8;text-align:right;margin-bottom:2px;font-family:monospace">You</div><div style="background:rgba(252,163,17,.15);border:1px solid rgba(252,163,17,.3);border-radius:12px 12px 3px 12px;padding:9px 13px;font-size:13px;color:#e8edf5">'+m.t+'</div></div>';
      return '<div style="align-self:flex-start;max-width:82%"><div style="font-size:9px;color:#fca311;margin-bottom:2px;font-family:monospace">'+m.u+'</div><div style="background:rgba(17,28,51,.9);border:1px solid #1e3050;border-radius:12px 12px 12px 3px;padding:9px 13px;font-size:13px;color:#e8edf5">'+m.t+'</div></div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function openRoomModal(name, online) {
    buildModal();
    var modal = document.getElementById('_rm');
    modal._rn = name;
    document.getElementById('_rmTitle').textContent = name;
    document.getElementById('_rmOnline').textContent = '● ' + (online||'—') + ' online';
    modal.style.display = 'flex';
    renderRoom(name);
  }

  // EVENT DELEGATION — intercept ALL clicks on room cards
  document.addEventListener('click', function(e) {
    var card = e.target.closest && e.target.closest('#pub-rooms .room-card');
    if (!card) return;
    e.stopPropagation();
    var nameEl = card.querySelector('.room-name');
    var onlineEl = card.querySelector('.room-online');
    var name = nameEl ? nameEl.textContent.replace(/[🌐🤝🚨📡]/g,'').trim() : 'Room';
    var online = onlineEl ? onlineEl.textContent.replace(/[^0-9]/g,'') : '';
    openRoomModal(name, online);
  }, true);

  // Fix tab buttons
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var roomsBtn = document.getElementById('ptab-rooms');
      var newsBtn  = document.getElementById('ptab-news');
      var liveBtn  = document.getElementById('ptab-live');
      if (newsBtn)  newsBtn.onclick  = function(){ pressSwitchTab('news'); };
      if (roomsBtn) roomsBtn.onclick = function(){ pressSwitchTab('rooms'); };
      if (liveBtn)  liveBtn.onclick  = function(){ pressSwitchTab('live'); };

      window.pressSwitchTab = function(tab) {
        var feed  = document.getElementById('press-feed');
        var rooms = document.getElementById('press-rooms');
        var live  = document.getElementById('press-live');
        if (feed)  feed.style.display  = tab==='news'  ? 'flex':'none';
        if (rooms) { rooms.style.display = tab==='rooms' ? 'block':'none'; if(tab==='rooms'){ var pubEl=document.getElementById('pub-rooms'); var privEl=document.getElementById('priv-rooms'); if(pubEl) pubEl.style.cssText='display:block;width:100%'; if(privEl) privEl.style.cssText='display:block;width:100%'; }}
        if (live)  live.style.display  = tab==='live'  ? 'flex':'none';
        [newsBtn,roomsBtn,liveBtn].forEach(function(b){if(b)b.classList.remove('active');});
        if (tab==='news'  && newsBtn)  newsBtn.classList.add('active');
        if (tab==='rooms' && roomsBtn) roomsBtn.classList.add('active');
        if (tab==='live'  && liveBtn)  liveBtn.classList.add('active');
        if (tab==='rooms' && typeof renderChatRooms==='function') renderChatRooms();
      };
      if (typeof renderChatRooms==='function') renderChatRooms();
    }, 500);
  });
})();

// Slow down ticker to news channel speed
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var ticker = document.querySelector('.ticker-inner');
    if (ticker) {
      ticker.style.animationDuration = '1200s';
    }
  }, 300);
});
