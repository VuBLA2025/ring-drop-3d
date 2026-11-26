// RING DROP 3D — server Node: phục vụ trang tĩnh + Socket.IO + Edge TTS giọng Hoài My + TikTok LIVE
// Chạy: npm install && node server.js (mặc định cổng 80, theo biến PORT nếu có)
// Giọng MC chạy trên server (Edge TTS, không cần key) nên nghe giống nhau trên mọi máy,
// giống Chùa Bình An — không còn phụ thuộc giọng trình duyệt của người xem nữa.
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { TikTokLiveConnection } = require('tiktok-live-connector');

const PORT = parseInt(process.env.PORT || '80', 10);

// ---------- Edge TTS (kênh đọc to của Microsoft Edge, không cần key) ----------
// Dùng gói msedge-tts: nó tự lo token Sec-MS-GEC + sửa lệch giờ, chạy phía server.
const VOICES = {
  hoaimy: { key: 'hoaimy', label: 'Nữ HoaiMy (mặc định)', name: 'vi-VN-HoaiMyNeural', rate: 1.0, pitch: '+0Hz' },
  'hoaimy-slow': { key: 'hoaimy-slow', label: 'Nữ HoaiMy chậm rãi', name: 'vi-VN-HoaiMyNeural', rate: 0.8, pitch: '+0Hz' },
  namminh: { key: 'namminh', label: 'Nam NamMinh trầm ấm', name: 'vi-VN-NamMinhNeural', rate: 1.0, pitch: '+0Hz' },
};
let currentVoiceKey = 'hoaimy';
let ttsOn = true;

// Một kết nối TTS cho mỗi giọng, giữ lại để đọc câu sau nhanh hơn.
const ttsPool = new Map();

async function getTts(voice) {
  let tts = ttsPool.get(voice.key);
  if (!tts) {
    tts = new MsEdgeTTS();
    await tts.setMetadata(voice.name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    ttsPool.set(voice.key, tts);
  }
  return tts;
}

let ttsBusy = 0; // số lần đọc thật đang chạy (để câu giữ ấm không chen vào)

function synthEdge(text, voice) {
  return new Promise(async (resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => finish(new Error('Edge TTS timeout sau 20s')), 20000);
    function finish(err, buf) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      ttsBusy = Math.max(0, ttsBusy - 1);
      if (err) {
        ttsPool.delete(voice.key); // kết nối hỏng thì lần sau tạo lại
        reject(err);
      } else resolve(buf);
    }
    ttsBusy++;
    try {
      const tts = await getTts(voice);
      const { audioStream } = await tts.toStream(text, { rate: voice.rate, pitch: voice.pitch });
      const chunks = [];
      audioStream.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
      audioStream.on('error', (e) => finish(e));
      audioStream.on('end', () => finish(null, Buffer.concat(chunks)));
      audioStream.on('close', () => {
        if (!done) finish(null, Buffer.concat(chunks));
      });
    } catch (e) {
      ttsPool.delete(voice.key);
      finish(e);
    }
  });
}

// Cache mp3 theo (giọng + câu): các câu hype/cảm ơn quà lặp lại rất nhiều nên
// lần sau phát ngay, không phải chờ Edge đọc lại và không sợ lỗi mạng xen vào.
const ttsCache = new Map();
const TTS_CACHE_MAX = 100;

async function synthWithRetry(text, voice) {
  try {
    return await synthEdge(text, voice);
  } catch (e) {
    // Lỗi một lần (mạng/Edge chập chờn): thử lại 1 lần với kết nối mới.
    ttsPool.delete(voice.key);
    return await synthEdge(text, voice);
  }
}

async function synthCached(text, voice) {
  const key = voice.key + '|' + text;
  const hit = ttsCache.get(key);
  if (hit) {
    ttsCache.delete(key); // đưa lên đầu (LRU đơn giản)
    ttsCache.set(key, hit);
    return hit;
  }
  const audio = await synthWithRetry(text, voice);
  ttsCache.set(key, audio);
  if (ttsCache.size > TTS_CACHE_MAX) {
    ttsCache.delete(ttsCache.keys().next().value);
  }
  return audio;
}

// Giữ kết nối Edge ấm: đọc một câu ngắn mỗi 50s (bỏ qua cache) để lần đọc
// thật sau đó không phải bắt tay lại từ đầu — tiết kiệm vài giây và đỡ lỗi
// do kết nối nguội. Bỏ qua khi đang có câu thật cần đọc.
const WARMUP_TEXT = 'Chào mừng anh em đến với sàn đấu!';
setInterval(async () => {
  if (ttsBusy > 0) return;
  try {
    const tts = await getTts(VOICES[currentVoiceKey]);
    const { audioStream } = await tts.toStream(WARMUP_TEXT, { rate: 1, pitch: '+0Hz' });
    audioStream.on('data', () => {});
    audioStream.on('error', () => {});
    audioStream.resume();
  } catch (e) { /* lần sau thử lại, không ảnh hưởng game */ }
}, 50000);

// Đọc trước 7 câu hype (câu cố định, nút Hô dùng đi dùng lại) để nút Hô
// phát ngay từ đầu live, không phải chờ đọc lần đầu.
const HYPE_LINES = [
  'Anh em ơi, bình luận ngay để thả Bi Kiếm vào sàn chiến đấu miễn phí nào!',
  'Thả tim liên tục để rơi Hộp Tăng Lực, giúp bi của bạn to gấp đôi và xoay siêu nhanh nhé!',
  'Chỉ một bông Hoa Hồng là có ngay Bi Lưỡi Cưa tốc độ cao càn quét sàn đấu nha mọi người!',
  'Sàn đấu sắp thu hẹp rồi! Tặng Donut thả Bom Xung Kích thổi bay đối thủ ra khỏi sàn đi anh em ơi!',
  'Ai sẽ là đại gia triệu hồi Boss Titan Vàng bốn đại kiếm để làm chủ sàn đấu hôm nay đây?',
  'Follow kênh ngay để nhận Bi Chùy Gai đẩy văng đối thủ cực mạnh nhé anh em!',
  'Tặng Kính Râm để đánh sập ngay vòng sàn ngoài, tạo pha lật kèo cực gắt nào mọi người!'
];
setTimeout(async () => {
  for (const line of HYPE_LINES) {
    try { await synthCached(line, VOICES[currentVoiceKey]); } catch (e) {}
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log('[ringdrop] da doc truoc xong 7 cau hype');
}, 5000);

// ---------- Trạng thái live ----------
const liveState = {
  mode: 'idle', // idle | connecting | live
  username: '',
  roomId: '',
  viewers: 0,
  totalLikes: 0,
  joinedCount: 0,
  lastError: '',
};

function publicStatus() {
  return { ...liveState, ttsOn, ttsVoice: currentVoiceKey, botOn: false };
}

// ---------- TikTok LIVE ----------
let tiktok = null;

function mapGift(d) {
  const name = String(d.giftName || '').toLowerCase();
  const diamonds = d.diamondCount || 0;
  if (name.includes('lion') || name.includes('galaxy') || diamonds >= 1000) return 'titan';
  if (name.includes('donut')) return 'bomb';
  if (name.includes('sunglass')) return 'collapse';
  if (name.includes('rose')) return 'rose';
  return 'saw';
}

async function disconnectTikTok() {
  if (tiktok) {
    const c = tiktok;
    tiktok = null;
    try { await c.disconnect(); } catch (e) {}
  }
  liveState.mode = 'idle';
  liveState.roomId = '';
  io.emit('tiktok:status', publicStatus());
}

function uname(d) {
  return (d && (d.uniqueId || (d.user && d.user.uniqueId))) || 'khách';
}

async function connectTikTok(username) {
  username = String(username || '').replace(/^@/, '').trim();
  if (!username) throw new Error('Chưa nhập username TikTok');
  await disconnectTikTok();
  liveState.username = username;
  liveState.mode = 'connecting';
  liveState.lastError = '';
  io.emit('tiktok:status', publicStatus());

  const conn = new TikTokLiveConnection(username, {
    processInitialData: true,
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: true,
  });
  tiktok = conn;

  conn.on('chat', (d) => io.emit('tiktok:chat', { username: uname(d) }));
  conn.on('follow', (d) => io.emit('tiktok:follow', { username: uname(d) }));
  conn.on('member', () => { liveState.joinedCount += 1; });
  conn.on('like', (d) => {
    const n = d.likeCount || 1;
    liveState.totalLikes += n;
    io.emit('tiktok:like', { username: uname(d), count: n });
  });
  conn.on('gift', (d) => {
    if (d.repeatEnd === false) return; // chờ hết chuỗi lặp mới hô 1 lần
    io.emit('tiktok:gift', { username: uname(d), type: mapGift(d), giftName: d.giftName, diamonds: d.diamondCount });
  });
  conn.on('roomUser', (d) => {
    if (typeof d.viewerCount === 'number') liveState.viewers = d.viewerCount;
    io.emit('tiktok:stats', { viewers: liveState.viewers });
  });
  conn.on('disconnected', () => {
    if (tiktok === conn) {
      liveState.mode = 'idle';
      liveState.roomId = '';
      io.emit('tiktok:status', publicStatus());
    }
  });
  conn.on('error', (e) => {
    liveState.lastError = e && e.message ? String(e.message).slice(0, 200) : 'Lỗi kết nối TikTok';
  });

  try {
    const state = await conn.connect();
    liveState.mode = 'live';
    liveState.roomId = (state && state.roomId) || conn.roomId || '';
    const ri = (state && state.roomInfo) || conn.roomInfo || {};
    const vc = ri.viewerCount || (ri.stats && ri.stats.viewerCount) || (ri.owner && ri.owner.viewerCount);
    if (typeof vc === 'number') liveState.viewers = vc;
    io.emit('tiktok:status', publicStatus());
    return publicStatus();
  } catch (e) {
    if (tiktok === conn) {
      tiktok = null;
      liveState.mode = 'idle';
      liveState.lastError = e && e.message ? String(e.message).slice(0, 200) : 'Không kết nối được TikTok';
      io.emit('tiktok:status', publicStatus());
    }
    throw e;
  }
}

// ---------- HTTP + Socket.IO ----------
const app = express();
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/status', (req, res) => res.json(publicStatus()));

app.get('/api/tts-voices', (req, res) => {
  res.json({ ok: true, current: currentVoiceKey, voices: Object.values(VOICES) });
});

app.post('/api/tts-voice', (req, res) => {
  const key = req.body && req.body.voice;
  if (!VOICES[key]) return res.status(400).json({ ok: false, error: 'Giọng không có: ' + key });
  currentVoiceKey = key;
  io.emit('tiktok:status', publicStatus());
  res.json({ ok: true, current: currentVoiceKey });
});

app.post('/api/tts', (req, res) => {
  ttsOn = !!(req.body && req.body.on);
  res.json({ ok: true, ttsOn });
});

app.post('/api/tts-say', async (req, res) => {
  const text = String((req.body && req.body.text) || '').trim();
  if (!text) return res.status(400).json({ ok: false, error: 'Thiếu text' });
  if (text.length > 500) return res.status(400).json({ ok: false, error: 'Câu quá dài (tối đa 500 ký tự)' });
  if (!ttsOn) return res.status(503).json({ ok: false, error: 'Giọng MC đang tắt' });
  try {
    const audio = await synthCached(text, VOICES[currentVoiceKey]);
    if (!audio || audio.length < 100) throw new Error('Edge TTS trả về audio rỗng');
    res.type('audio/mpeg').send(audio);
  } catch (e) {
    console.error('[tts-say]', e && e.message ? e.message : e);
    res.status(502).json({ ok: false, error: 'Không đọc được giọng Hoài My lúc này, thử lại sau' });
  }
});

app.post('/api/tiktok/connect', async (req, res) => {
  try {
    const status = await connectTikTok(req.body && req.body.username);
    res.json({ ok: true, status });
  } catch (e) {
    res.status(500).json({ ok: false, error: liveState.lastError || (e && e.message) || 'Không kết nối được', status: publicStatus() });
  }
});

app.post('/api/tiktok/disconnect', async (req, res) => {
  await disconnectTikTok();
  res.json({ ok: true, status: publicStatus() });
});

// Không để lộ file server / cấu hình qua HTTP
const BLOCKED_FILES = new Set(['server.js', 'package.json', 'package-lock.json', 'Dockerfile', 'nginx.conf', '.gitignore', '.dockerignore']);
app.use((req, res, next) => {
  const parts = decodeURIComponent(req.path).split('/').filter(Boolean);
  if (parts.includes('.git') || parts.includes('node_modules')) return res.status(404).end();
  if (parts.length && BLOCKED_FILES.has(parts[parts.length - 1])) return res.status(404).end();
  next();
});
app.use(express.static(__dirname, { index: 'index.html', extensions: ['html'] }));

const server = http.createServer(app);
const io = new Server(server);
io.on('connection', (socket) => {
  socket.emit('tiktok:status', publicStatus());
});

server.listen(PORT, () => {
  console.log(`[ringdrop] listening on :${PORT} — voice=${VOICES[currentVoiceKey].name}`);
});

process.on('SIGTERM', async () => {
  try { await disconnectTikTok(); } catch (e) {}
  server.close(() => process.exit(0));
});
