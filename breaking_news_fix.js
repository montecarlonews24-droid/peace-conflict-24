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

// ── ROOMS FIX ──
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

      if(feed)  feed.style.display  = tab==='news'  ? 'flex':'none';
      if(rooms) rooms.style.display = tab==='rooms' ? 'flex':'none';
      if(live)  live.style.display  = tab==='live'  ? 'flex':'none';

      [newsBtn,roomsBtn,liveBtn].forEach(function(b){ if(b) b.classList.remove('active'); });
      if(tab==='news'  && newsBtn)  newsBtn.classList.add('active');
      if(tab==='rooms' && roomsBtn) roomsBtn.classList.add('active');
      if(tab==='live'  && liveBtn)  liveBtn.classList.add('active');

      if(tab==='rooms' && typeof renderChatRooms==='function') renderChatRooms();
    };

    // Create chat-room-list inside press-rooms if missing
    var pressRooms = document.getElementById('press-rooms');
    if(pressRooms && !document.getElementById('chat-room-list')) {
      var chatList = document.createElement('div');
      chatList.id = 'chat-room-list';
      chatList.style.cssText = 'flex:1;overflow-y:auto;padding:12px;width:100%';
      pressRooms.appendChild(chatList);
    }

    // Create active-chat if missing
    if(!document.getElementById('active-chat')) {
      var activeChat = document.createElement('div');
      activeChat.id = 'active-chat';
      activeChat.className = 'hidden';
      activeChat.style.cssText = 'position:absolute;inset:0;background:var(--bg0);z-index:50;display:none;flex-direction:column';
      var scr = document.getElementById('scr-chat');
      if(scr) scr.appendChild(activeChat);
    }

    if(typeof renderChatRooms==='function') renderChatRooms();

  }, 700);
});
