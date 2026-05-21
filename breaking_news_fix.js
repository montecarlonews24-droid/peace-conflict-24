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

// ── ROOMS FIX ──
(function() {
  var msgs = {};
  var defaults = {
    r1:[{u:'Atlas_77',t:'Tensions in Red Sea continue affecting global shipping.'},{u:'IntelWatcher',t:'Three diplomatic channels reportedly active in parallel.'}],
    r2:[{u:'PeaceKeeper',t:'Ceasefire negotiations entered third round.'},{u:'Mediator9',t:'Both parties agreed to 72-hour humanitarian pause.'}],
    r3:[{u:'AidWorker',t:'Supply convoys delayed due to road access restrictions.'},{u:'ReliefOps',t:'UNHCR deployed additional resources to northern sector.'}],
    r4:[{u:'SIGINT_Alpha',t:'Satellite imagery confirms troop repositioning in sector 7.'},{u:'GhostAnalyst',t:'Major announcement expected within 48 hours.'}],
  };

  function getModal() {
    var m = document.getElementById('_room_modal');
    if(m) return m;
    m = document.createElement('div');
    m.id = '_room_modal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#040810;display:flex;flex-direction:column';
    m.innerHTML =
      '<div style="background:rgba(8,15,30,.98);border-bottom:1px solid #1e3050;padding:10px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0">' +
        '<button id="_room_back" style="background:none;border:none;color:#8fa8c8;font-size:26px;cursor:pointer;line-height:1">←</button>' +
        '<div style="flex:1">' +
          '<div id="_room_title" style="font-family:Rajdhani,sans-serif;font-size:16px;font-weight:700;color:#fca311"></div>' +
          '<div id="_room_online" style="font-size:9px;color:#2dc653;font-family:monospace"></div>' +
        '</div>' +
        '<span style="font-size:9px;color:#2dc653">🔐 Encrypted</span>' +
      '</div>' +
      '<div id="_room_msgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch"></div>' +
      '<div style="background:rgba(8,15,30,.98);border-top:1px solid #1e3050;padding:10px 12px 22px;display:flex;gap:8px;align-items:center;flex-shrink:0">' +
        '<input id="_room_inp" placeholder="Type a message..." style="flex:1;background:rgba(17,28,51,.8);border:1px solid #1e3050;border-radius:12px;padding:10px 14px;font-size:15px;color:#e8edf5;outline:none" onkeydown="if(event.key===\'Enter\')window._roomSend()"/>' +
        '<button onclick="window._roomSend()" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#fca311,#f77f00);border:none;cursor:pointer;font-size:18px">➤</button>' +
      '</div>';
    document.body.appendChild(m);
    document.getElementById('_room_back').onclick = function() {
      m.style.display = 'none';
    };
    return m;
  }

  function renderMsgs(id) {
    if(!msgs[id]) msgs[id] = (defaults[id]||[]).map(function(x){return {u:x.u,t:x.t,me:false};});
    var el = document.getElementById('_room_msgs');
    el.innerHTML = msgs[id].map(function(m) {
      if(m.me) return '<div style="align-self:flex-end;max-width:82%"><div style="font-size:9px;color:#8fa8c8;text-align:right;margin-bottom:2px;font-family:monospace">You</div><div style="background:rgba(252,163,17,.15);border:1px solid rgba(252,163,17,.3);border-radius:12px 12px 3px 12px;padding:9px 13px;font-size:13px;line-height:1.5;color:#e8edf5">'+m.t+'</div></div>';
      return '<div style="align-self:flex-start;max-width:82%"><div style="font-size:9px;color:#fca311;margin-bottom:2px;font-family:monospace">'+m.u+'</div><div style="background:rgba(17,28,51,.9);border:1px solid #1e3050;border-radius:12px 12px 12px 3px;padding:9px 13px;font-size:13px;line-height:1.5;color:#e8edf5">'+m.t+'</div></div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  window._roomSend = function() {
    var modal = document.getElementById('_room_modal');
    var inp = document.getElementById('_room_inp');
    if(!inp||!inp.value.trim()||!modal._rid) return;
    msgs[modal._rid].push({u:'You',t:inp.value.trim(),me:true});
    inp.value='';
    renderMsgs(modal._rid);
  };

  // Override openRoom completely
  window.openRoom = function(id, type, name) {
    var modal = getModal();
    modal._rid = id;
    var roomNames = {
      r1:'🌐 Global Analysis Hub', r2:'🤝 Diplomatic Solutions',
      r3:'🚨 Humanitarian Response', r4:'📡 Intelligence Briefing',
      p1:'🔒 EU-Ukraine Negotiations', p2:'🔒 Middle East Peace Summit',
      p3:'🔒 Crisis Response Command', p4:'🔒 Sovereign Intelligence'
    };
    var roomOnline = {r1:342,r2:256,r3:189,r4:421};
    document.getElementById('_room_title').textContent = roomNames[id]||name||id;
    document.getElementById('_room_online').textContent = '● '+(roomOnline[id]||'—')+' online';
    modal.style.display = 'flex';
    renderMsgs(id);
  };

  // Fix tab buttons
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var roomsBtn = document.getElementById('ptab-rooms');
      var newsBtn  = document.getElementById('ptab-news');
      var liveBtn  = document.getElementById('ptab-live');
      if(newsBtn)  newsBtn.onclick  = function(){ pressSwitchTab('news'); };
      if(roomsBtn) roomsBtn.onclick = function(){ pressSwitchTab('rooms'); };
      if(liveBtn)  liveBtn.onclick  = function(){ pressSwitchTab('live'); };

      window.pressSwitchTab = function(tab) {
        var feed  = document.getElementById('press-feed');
        var rooms = document.getElementById('press-rooms');
        var live  = document.getElementById('press-live');
        if(feed)  feed.style.display  = tab==='news'  ? 'flex':'none';
        if(rooms) rooms.style.display = tab==='rooms' ? 'flex':'none';
        if(live)  live.style.display  = tab==='live'  ? 'flex':'none';
        [newsBtn,roomsBtn,liveBtn].forEach(function(b){if(b)b.classList.remove('active');});
        if(tab==='news'  && newsBtn)  newsBtn.classList.add('active');
        if(tab==='rooms' && roomsBtn) roomsBtn.classList.add('active');
        if(tab==='live'  && liveBtn)  liveBtn.classList.add('active');
        if(tab==='rooms' && typeof renderChatRooms==='function') renderChatRooms();
      };
      if(typeof renderChatRooms==='function') renderChatRooms();
    }, 500);
  });
})();
