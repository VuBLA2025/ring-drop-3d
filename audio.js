// Crisp Tactile Metallic SFX + Vietnamese MC Voice Announcer (Edge TTS HoaiMy via server)
class ArenaAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastClashAt = 0;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClash(intensity = 1) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastClashAt < 0.045) return;
    this.lastClashAt = now;

    const vol = Math.min(0.14, 0.05 + intensity * 0.06);
    const base = 680 + Math.random() * 480;
    [1, 1.47, 2.31].forEach((r, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(base * r, now);
      osc.frequency.exponentialRampToValueAtTime(base * r * 0.82, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol / (i + 1), now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    });
  }

  playSlam(heavy = false) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(heavy ? 135 : 175, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + (heavy ? 0.32 : 0.16));
    gain.gain.setValueAtTime(heavy ? 0.22 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.36 : 0.18));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playKO() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.32);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playBuff() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    [520, 780].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.24);
    });
  }

  // Crisp celebratory fanfare stinger when someone sends a gift
  playGiftFanfare(tier = 1) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = tier >= 3
      ? [523.25, 659.25, 783.99, 1046.5] // Boss Titan grand chord
      : tier === 2
        ? [440, 554.37, 659.25]          // Bomb / Collapse
        : [587.33, 880];                 // Rose / Follow

    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tier >= 3 ? 'triangle' : 'sine';
      const t = now + idx * 0.065;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(tier >= 3 ? 0.13 : 0.09, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (tier >= 3 ? 0.5 : 0.26));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  playExplosion() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.34);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    this.playSlam(true);
  }

  playWarning() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

// ============================================================================
// VIETNAMESE MC VOICE ANNOUNCER (Edge TTS HoaiMy via server + Priority Queue + Hype Lines)
// ============================================================================
class ArenaVoice {
  constructor() {
    this.enabled = true;
    this.autoHype = true;
    this.queue = [];
    this.speaking = false;
    this.onSubtitle = null;
    this.lastHypeIndex = -1;
    // Giọng MC chạy trên server (Edge TTS Hoài My), không dùng giọng trình duyệt nữa.
    this.audio = typeof Audio !== 'undefined' ? new Audio() : null;
    if (this.audio) this.audio.preload = 'auto';
    this.currentUrl = null;

    this.hypeLines = [
      'Anh em ơi, bình luận ngay để thả Bi Kiếm vào sàn chiến đấu miễn phí nào!',
      'Thả tim liên tục để rơi Hộp Tăng Lực, giúp bi của bạn to gấp đôi và xoay siêu nhanh nhé!',
      'Chỉ một bông Hoa Hồng là có ngay Bi Lưỡi Cưa tốc độ cao càn quét sàn đấu nha mọi người!',
      'Sàn đấu sắp thu hẹp rồi! Tặng Donut thả Bom Xung Kích thổi bay đối thủ ra khỏi sàn đi anh em ơi!',
      'Ai sẽ là đại gia triệu hồi Boss Titan Vàng bốn đại kiếm để làm chủ sàn đấu hôm nay đây?',
      'Follow kênh ngay để nhận Bi Chùy Gai đẩy văng đối thủ cực mạnh nhé anh em!',
      'Tặng Kính Râm để đánh sập ngay vòng sàn ngoài, tạo pha lật kèo cực gắt nào mọi người!'
    ];

    // Câu đang lấy giọng / đang phát (để chen ngang không làm mất câu).
    this._current = null;

  }

  stopAudio() {
    if (this.audio) {
      try { this.audio.pause(); } catch (e) {}
      this.audio.removeAttribute('src');
      try { this.audio.load(); } catch (e) {}
    }
    if (this.currentUrl) {
      try { URL.revokeObjectURL(this.currentUrl); } catch (e) {}
      this.currentUrl = null;
    }
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) {
      this.queue = [];
      this.stopAudio();
      this.speaking = false;
      if (this.onSubtitle) this.onSubtitle('');
    }
  }

  // priority: 1 = hype/low, 2 = follow/rose, 3 = bomb/collapse/win, 4 = BOSS TITAN (interrupts!)
  speak(text, priority = 2) {
    if (!text) return;

    // Giọng chạy trên server nên không cần kiểm tra giọng trình duyệt nữa.
    if (!this.enabled) return;

    // High-priority Boss / Big Gift interrupts low-priority hype speech immediately.
    // Câu đang lấy giọng / đang phát được xếp lại lên đầu hàng để không bị mất
    // (fetch xong muộn mà không còn ai phát nó nữa thì câu biến mất hẳn).
    if (priority >= 4 && this.speaking) {
      const cur = this._current;
      this.stopAudio();
      this.speaking = false;
      this._current = null;
      this.queue = this.queue.filter(item => item.priority >= 3);
      if (cur && cur.priority < 4) this.queue.unshift(cur);
    }

    // Câu cảm ơn/quà thật (ưu tiên >= 2) không phải chờ sau các câu hype tự động:
    // bỏ hết câu hype (ưu tiên 1) đang xếp hàng để câu thật được đọc ngay.
    if (priority >= 2) {
      this.queue = this.queue.filter(item => item.priority >= 2);
    }

    // Prevent backlog spam during mayhem mode
    if (this.queue.length >= 3) {
      if (priority <= 1) return;
      this.queue.sort((a, b) => b.priority - a.priority);
      this.queue.pop();
    }

    this.queue.push({ text, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this._processNext();
  }

  _processNext() {
    if (!this.enabled || this.speaking || this.queue.length === 0) return;

    const item = this.queue.shift();
    this.speaking = true;
    this._current = item;
    if (this.onSubtitle) this.onSubtitle(item.text);

    // Lấy giọng Hoài My từ server (Edge TTS) rồi phát bằng <audio>.
    const finish = () => {
      clearTimeout(safetyTimer);
      this.speaking = false;
      this._current = null;
      if (this.queue.length === 0 && this.onSubtitle) {
        this.onSubtitle('');
      }
      setTimeout(() => this._processNext(), 160);
    };

    // Safety guard in case onended doesn't fire
    const safetyTimer = setTimeout(finish, Math.max(8000, item.text.length * 220));

    if (!this.audio) {
      finish();
      return;
    }

    // Lấy giọng từ server, lỗi mạng/502 thì thử lại 1 lần (Cloudflare thỉnh
    // thoảng trả 502, trước đây câu đó mất hẳn không nói gì).
    const fetchTts = (attempt) => fetch('/api/tts-say', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: item.text }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('TTS ' + r.status);
        return r.blob();
      })
      .catch((e) => {
        if (attempt < 2) {
          return new Promise((res) => setTimeout(() => res(fetchTts(attempt + 1)), 800));
        }
        throw e;
      });

    fetchTts(1)
      .then((blob) => {
        // Câu này đã bị chen ngang / hết giờ an toàn trong lúc chờ fetch:
        // nó đã được xếp lại hàng, không phát chèn ở đây nữa.
        if (this._current !== item) return;
        if (this.currentUrl) {
          try { URL.revokeObjectURL(this.currentUrl); } catch (e) {}
        }
        this.currentUrl = URL.createObjectURL(blob);
        this.audio.onended = finish;
        this.audio.onerror = finish;
        this.audio.src = this.currentUrl;
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => finish());
      })
      .catch(() => {
        // Server TTS lỗi cả 2 lần: chỉ hiện phụ đề, không câm cả sân.
        if (this._current === item) finish();
      });
  }

  announceGift(userName, giftType) {
    const templates = {
      follow: [
        `Cảm ơn ${userName} đã follow kênh nhé! Lên ngay Bi Chùy Gai siêu nặng!`,
        `Cảm ơn bạn ${userName} đã follow! Bi Chùy Gai xuất trận đẩy bay tất cả!`
      ],
      rose: [
        `Cảm ơn ${userName} tặng Hoa Hồng nhé! Triệu hồi Bi Lưỡi Cưa tốc độ cao!`,
        `Quá tuyệt vời! Cảm ơn ${userName} tặng Hoa Hồng, Bi Lưỡi Cưa vào sàn!`
      ],
      bomb: [
        `Ối dồi ôi! Cảm ơn ${userName} tặng Donut thả Bom Xung Kích! Chạy ngay đi anh em ơi!`,
        `Cảm ơn ${userName} thả Bom Xung Kích! Sắp nổ tung sàn đấu rồi!`
      ],
      collapse: [
        `Cảm ơn ${userName} tặng Kính Râm kích hoạt Sập Sàn! Vòng ngoài đang rơi rồi!`,
        `Căng cực! ${userName} vừa đánh sập vòng sàn ngoài, anh em cẩn thận mép sàn!`
      ],
      titan: [
        `Đỉnh của chóp! Cảm ơn đại gia ${userName} tặng Sư Tử triệu hồi Boss Titan Vàng bốn đại kiếm!`,
        `Chấn động sàn đấu! Cảm ơn ${userName} đã thả Boss Titan Vàng khổng lồ càn quét tất cả!`
      ]
    };

    const list = templates[giftType];
    if (!list) return;
    const line = list[Math.floor(Math.random() * list.length)];
    const priority = giftType === 'titan' ? 4 : (giftType === 'bomb' || giftType === 'collapse') ? 3 : 2;
    this.speak(line, priority);
  }

  announceWinner(name, kills) {
    const line = kills > 0
      ? `Chúc mừng nhà vô địch ${name} đã quét sạch sàn đấu với ${kills} mạng hạ gục! Quá đỉnh!`
      : `Chúc mừng ${name} là người sống sót cuối cùng và vô địch vòng này!`;
    this.speak(line, 3);
  }

  speakHype() {
    let idx = Math.floor(Math.random() * this.hypeLines.length);
    if (idx === this.lastHypeIndex) idx = (idx + 1) % this.hypeLines.length;
    this.lastHypeIndex = idx;
    this.speak(this.hypeLines[idx], 1);
  }
}

window.arenaAudio = new ArenaAudio();
window.arenaVoice = new ArenaVoice();
