# RING DROP 3D — Đấu Trường Bi Vũ Khí (TikTok LIVE)

Game tương tác TikTok LIVE khung dọc **9:16** dựng bằng **Three.js 3D PBR** (không cần build step), có vật lý va chạm vũ khí 3D, sập sàn 3 vòng, giọng **MC tiếng Việt tự động hô cảm ơn tặng quà & kêu gọi tương tác**, và bảng quà trực quan ngay trên màn hình LIVE.

## Tính năng nổi bật
- **Đồ họa 3D PBR (Three.js):** Vật liệu gốm bóng (`clearcoat`), kim loại chrome/titan phản chiếu studio (`PMREM`), đổ bóng mềm thời gian thực.
- **Vũ khí 3D xoay vật lý:** Bi Kiếm Katana đôi, Bi Chùy Gai, Bi Lưỡi Cưa tốc độ cao và **Boss Titan Vàng (4 Đại Kiếm)** với hit-stop, tia lửa 3D và rung camera.
- **Sập sàn 3 tầng:** Đếm ngược thu hẹp sàn đấu, từng mảng sàn ngoài rung lắc cảnh báo đỏ rồi vỡ rơi xuống vực.
- **MC Giọng nói Tiếng Việt (Edge TTS Hoài My qua server):** Tự động đọc tên người tặng quà, hô chúc mừng vô địch, kèm thẻ vinh danh + phụ đề sóng âm và lời kêu gọi tặng quà định kỳ. Giọng chạy trên server nên nghe giống nhau trên mọi máy, giống Chùa Bình An; panel có ô chọn giọng Hoài My / Hoài My chậm / NamMinh.
- **Bảng Quà & Chế độ OBS 9:16 sạch:** Hiển thị bảng quà trực tiếp trên sân khấu, hỗ trợ ẩn bảng điều khiển để đưa thẳng vào **OBS Studio / TikTok LIVE Studio**.

## Chạy cục bộ
Cần Node 20 trở lên (server làm giọng đọc + kết nối TikTok):

```bash
npm install
node server.js   # mặc định cổng 80, đổi bằng biến PORT
```

Sau đó mở trình duyệt tại `http://localhost/` (giao diện điều khiển) hoặc `http://localhost/stage` (màn hình 9:16 sạch mặc định).

## Link Stage 9:16 cho OBS / TikTok LIVE Studio
Mở trực tiếp đường dẫn `/stage` (ví dụ `https://ringdrop.bla.io.vn/stage`) để hiển thị mặc định khung dọc **9:16** sạch, không hiện bảng điều khiển:
- `https://ringdrop.bla.io.vn/stage` — Mặc định 9:16 đầy đủ (tự chạy giả lập + giọng MC + Bảng Quà)
- Tùy chọn tham số URL:
  - `?auto=0` — Tắt bot giả lập (chỉ nhận sự kiện thật từ `RingDropAPI`)
  - `?board=0` — Ẩn Bảng Quà ở chân màn hình
  - `?voice=0` hoặc `?hype=0` — Tắt giọng MC hoặc lời kêu gọi định kỳ
  - `?pace=normal|fast|mayhem` — Tốc độ phòng Live giả lập

## Phím tắt giả lập nhanh
- `1` — 💬 Comment • Bi Kiếm
- `2` — ➕ Follow • Bi Chùy Gai (MC hô cảm ơn)
- `3` — 🌹 Hoa Hồng • Bi Lưỡi Cưa (MC hô cảm ơn)
- `4` — ❤️ Thả Tim • Hộp Buff Tăng Lực
- `5` — 🍩 Donut • Bom Xung Kích
- `6` — 🕶️ Kính Râm • Sập Vòng Ngoài
- `7` — 🦁 Sư Tử • Boss Titan Vàng
- `H` — 📢 MC hô kêu gọi tặng quà ngay

## Kết nối TikTok LIVE thật
Server đã tích hợp sẵn `tiktok-live-connector`: mở panel, nhập @username TikTok đang live rồi bấm **Kết nối LIVE** là xong, không cần TikFinity.

- Comment → Bi Kiếm • Follow → Bi Chùy Gai • Thả tim → Hộp Buff
- Hoa Hồng → Bi Lưỡi Cưa • Donut → Bom Xung Kích • Kính Râm → Sập Vòng Sàn
- Sư Tử / Thiên Hà (từ 1000 xu) → Boss Titan Vàng

Muốn tự tích hợp cầu nối khác thì game vẫn có sẵn API toàn cục `window.RingDropAPI`:

```js
window.RingDropAPI.onComment('Minh Anh');
window.RingDropAPI.onFollow('Khang Vũ');
window.RingDropAPI.onLike();
window.RingDropAPI.onGift('Khánh Linh', 'rose' | 'bomb' | 'collapse' | 'titan');
```

## Giọng MC (Edge TTS)
- `GET /api/tts-voices` — danh sách giọng, `POST /api/tts-voice {voice}` — đổi giọng
  (`hoaimy` mặc định, `hoaimy-slow`, `namminh`), `POST /api/tts-say {text}` — đọc 1 câu.
- Giọng chạy trên server qua kênh đọc to của Microsoft Edge, không cần key.
