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
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {

    // Fix tab buttons
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
      if(feed)  feed.style.display  = tab==='news'  ? 'flex':'none';
      if(rooms) rooms.style.display = tab==='rooms' ? 'flex':'none';
      if(live)  live.style.display  = tab==='live'  ? 'flex':'none';
      [newsBtn,roomsBtn,liveBtn].forEach(function(b){ if(b) b.classList.remove('active'); });
      if(tab==='news'  && newsBtn)  newsBtn.classList.add('active');
      if(tab==='rooms' && roomsBtn) roomsBtn.classList.add('active');
      if(tab==='live'  && liveBtn)  liveBtn.classList.add('active');
      if(tab==='rooms' && typeof renderChatRooms==='function') renderChatRooms();
    };

    // Build chat modal once
    function buildChatModal() {
      if(document.getElementById('fix-chat-modal')) return;
      var modal = document.createElement('div');
      modal.id = 'fix-chat-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:999;background:#040810;display:none;flex-direction:column';
      modal.innerHTML = `
        <div style="background:rgba(8,15,30,.98);border-bottom:1px solid #1e3050;padding:10px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0">
          <button onclick="document.getElementById('fix-chat-modal').style.display='none'" style="background:none;border:none;color:#8fa8c8;font-size:24px;cursor:pointer">←</button>
          <div style="flex:1">
            <div id="fix-room-title" style="font-family:Rajdhani,sans-serif;font-size:16px;font-weight:700;color:#fca311"></div>
            <div id="fix-room-online" style="font-family:monospace;font-size:9px;color:#2dc653"></div>
          </div>
          <div style="font-size:9px;color:#2dc653">🔐 Encrypted</div>
        </div>
        <div id="fix-chat-msgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px"></div>
        <div style="background:rgba(8,15,30,.98);border-top:1px solid #1e3050;padding:10px 12px 20px;display:flex;gap:8px;align-items:center;flex-shrink:0">
          <input id="fix-chat-inp" style="flex:1;background:rgba(17,28,51,.8);border:1px solid #1e3050;border-radius:12px;padding:10px 14px;font-size:15px;color:#e8edf5;outline:none" placeholder="Type a message..." onkeydown="if(event.key==='Enter')fixSendMsg()"/>
          <button onclick="fixSendMsg()" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#fca311,#f77f00);border:none;cursor:pointer;font-size:18px;color:#000">➤</button>
        </div>`;
      document.body.appendChild(modal);
    }

    var fixMessages = {};

    window.fixOpenRoom = function(id, name, online) {
      buildChatModal();
      var modal = document.getElementById('fix-chat-modal');
      document.getElementById('fix-room-title').textContent = name;
      document.getElementById('fix-room-online').textContent = '● ' + online + ' online';
      modal._roomId = id;

      var defaultMsgs = {
        'r1': [{u:'Atlas_77',t:'Tensions in Red Sea continue affecting global shipping.'},{u:'IntelWatcher',t:'Three diplomatic channels reportedly active in parallel.'},{u:'CrisisOps',t:'G20 emergency session likely within 48 hours.'}],
        'r2': [{u:'PeaceKeeper',t:'Ceasefire negotiations entered third round.'},{u:'Mediator9',t:'Both parties agreed to 72-hour humanitarian pause.'}],
        'r3': [{u:'AidWorker',t:'Supply convoys delayed due to road restrictions.'},{u:'ReliefOps',t:'UNHCR deployed additional resources to northern sector.'}],
        'r4': [{u:'SIGINT_Alpha',t:'Satellite imagery confirms troop repositioning in sector 7.'},{u:'GhostAnalyst',t:'Intercepts suggest major announcement within 48 hours.'}],
      };
      if(!fixMessages[id]) fixMessages[id] = (defaultMsgs[id]||[]).slice();

      var msgs = document.getElementById('fix-chat-msgs');
      msgs.innerHTML = fixMessages[id].map(function(m) {
        return '<div style="align-self:flex-start;max-width:82%"><div style="font-family:monospace;font-size:9px;color:#fca311;margin-bottom:3px">'+m.u+'</div><div style="background:rgba(17,28,51,.9);border:1px solid #1e3050;border-radius:12px 12px 12px 3px;padding:9px 13px;font-size:13px;line-height:1.5;color:#e8edf5">'+m.t+'</div></div>';
      }).join('');
      msgs.scrollTop = msgs.scrollHeight;
      modal.style.display = 'flex';
    };

    window.fixSendMsg = function() {
      var modal = document.getElementById('fix-chat-modal');
      var inp = document.getElementById('fix-chat-inp');
      var text = inp.value.trim();
      if(!text) return;
      inp.value = '';
      var id = modal._roomId;
      if(!fixMessages[id]) fixMessages[id] = [];
      fixMessages[id].push({u:'You', t:text});
      var msgs = document.getElementById('fix-chat-msgs');
      var div = document.createElement('div');
      div.style.cssText = 'align-self:flex-end;max-width:82%';
      div.innerHTML = '<div style="font-family:monospace;font-size:9px;color:#8fa8c8;text-align:right;margin-bottom:3px">You</div><div style="background:linear-gradient(135deg,rgba(252,163,17,.2),rgba(247,127,0,.15));border:1px solid rgba(252,163,17,.3);border-radius:12px 12px 3px 12px;padding:9px 13px;font-size:13px;line-height:1.5;color:#e8edf5">'+text+'</div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    };

    // Patch room cards after render
    function patchRoomCards() {
      var cards = document.querySelectorAll('#pub-rooms .room-card');
      var rooms = [
        {id:'r1', name:'🌐 Global Analysis Hub', online:342},
        {id:'r2', name:'🤝 Diplomatic Solutions', online:256},
        {id:'r3', name:'🚨 Humanitarian Response', online:189},
        {id:'r4', name:'📡 Intelligence Briefing', online:421},
      ];
      cards.forEach(function(card, i) {
        var r = rooms[i] || {id:'r'+i, name:'Room', online:100};
        card.onclick = function(e) {
          e.stopPropagation();
          window.fixOpenRoom(r.id, r.name, r.online);
        };
      });
    }

    // Patch after rooms render
    var origRender = window.renderChatRooms;
    window.renderChatRooms = function() {
      if(typeof origRender === 'function') origRender();
      setTimeout(patchRoomCards, 100);
    };

    if(typeof renderChatRooms==='function') renderChatRooms();

  }, 800);
});
