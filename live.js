// Cầu nối TikTok LIVE thật: nhận sự kiện từ server rồi gọi window.RingDropAPI.
// Sự kiện tới trước khi game sẵn sàng sẽ được xếp hàng, chờ 'ringdrop:ready' rồi mới chạy.
(function () {
  const pending = [];
  let ready = false;

  function flush() {
    if (!ready || !window.RingDropAPI) return;
    while (pending.length) {
      const fn = pending.shift();
      try { fn(); } catch (e) {}
    }
  }

  function whenReady(fn) {
    if (ready && window.RingDropAPI) {
      try { fn(); } catch (e) {}
      return;
    }
    pending.push(fn);
  }

  window.addEventListener('ringdrop:ready', () => {
    ready = true;
    flush();
  });
  if (window.RingDropAPI) ready = true;

  function renderStatus(d) {
    const st = document.getElementById('tiktokStatus');
    const btnC = document.getElementById('btnTiktokConnect');
    const btnD = document.getElementById('btnTiktokDisconnect');
    if (!st) return;
    const apply = (s) => {
      if (!s) return;
      if (s.mode === 'live') {
        st.textContent = 'Đang live: @' + s.username + ' • ' + (s.viewers || 0) + ' người xem • ' + (s.totalLikes || 0) + ' tim';
        if (btnC) btnC.style.display = 'none';
        if (btnD) btnD.style.display = '';
      } else if (s.mode === 'connecting') {
        st.textContent = 'Đang kết nối @' + s.username + '...';
      } else {
        st.textContent = s.lastError
          ? 'Chưa kết nối: ' + s.lastError
          : 'Chưa kết nối — đang chạy giả lập.';
        if (btnC) btnC.style.display = '';
        if (btnD) btnD.style.display = 'none';
      }
    };
    if (d) apply(d);
    else fetch('/api/status').then((r) => r.json()).then(apply).catch(() => {});
  }

  function bindSocket() {
    if (typeof io === 'undefined') return;
    const socket = io();
    socket.on('tiktok:chat', (d) => whenReady(() => window.RingDropAPI.onComment(d.username)));
    socket.on('tiktok:follow', (d) => whenReady(() => window.RingDropAPI.onFollow(d.username)));
    socket.on('tiktok:like', (d) => whenReady(() => {
      const n = Math.min(Math.max(1, d.count || 1), 3);
      for (let i = 0; i < n; i++) window.RingDropAPI.onLike();
    }));
    socket.on('tiktok:gift', (d) => whenReady(() => window.RingDropAPI.onGift(d.username, d.type)));
    socket.on('tiktok:stats', (d) => {
      const el = document.getElementById('viewerCount');
      if (el && typeof d.viewers === 'number') {
        el.textContent = d.viewers >= 1000 ? (d.viewers / 1000).toFixed(1) + 'K' : String(d.viewers);
      }
    });
    socket.on('tiktok:status', (d) => renderStatus(d));
    renderStatus(null);
  }

  function bindPanel() {
    const btnC = document.getElementById('btnTiktokConnect');
    const btnD = document.getElementById('btnTiktokDisconnect');
    const input = document.getElementById('tiktokUsername');
    const sel = document.getElementById('ttsVoice');
    if (btnC) {
      btnC.addEventListener('click', () => {
        const u = input ? input.value.trim() : '';
        if (!u) {
          alert('Nhập @username TikTok đang live đã ạ');
          return;
        }
        btnC.textContent = 'Đang kết nối...';
        fetch('/api/tiktok/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u }),
        })
          .then((r) => r.json())
          .then((j) => renderStatus(j.status || j))
          .catch(() => {})
          .finally(() => { btnC.textContent = 'Kết nối LIVE'; });
      });
    }
    if (btnD) {
      btnD.addEventListener('click', () => {
        fetch('/api/tiktok/disconnect', { method: 'POST' })
          .then((r) => r.json())
          .then((j) => renderStatus(j.status || j))
          .catch(() => {});
      });
    }
    if (sel) {
      fetch('/api/tts-voices')
        .then((r) => r.json())
        .then((j) => { if (j.current) sel.value = j.current; })
        .catch(() => {});
      sel.addEventListener('change', () => {
        fetch('/api/tts-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voice: sel.value }),
        }).catch(() => {});
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindSocket();
      bindPanel();
    });
  } else {
    bindSocket();
    bindPanel();
  }
})();
