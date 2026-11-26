# RING DROP 3D — Đấu Trường Bi Vũ Khí (TikTok LIVE)

Game tương tác TikTok LIVE khung dọc **9:16** dựng bằng **Three.js 3D PBR** (không cần build step), có vật lý va chạm vũ khí 3D, sập sàn 3 vòng, giọng **MC tiếng Việt tự động hô cảm ơn tặng quà & kêu gọi tương tác**, và bảng quà trực quan ngay trên màn hình LIVE.

## Tính năng nổi bật
- **Đồ họa 3D PBR (Three.js):** Vật liệu gốm bóng (`clearcoat`), kim loại chrome/titan phản chiếu studio (`PMREM`), đổ bóng mềm thời gian thực.
- **Vũ khí 3D xoay vật lý:** Bi Kiếm Katana đôi, Bi Chùy Gai, Bi Lưỡi Cưa tốc độ cao và **Boss Titan Vàng (4 Đại Kiếm)** với hit-stop, tia lửa 3D và rung camera.
- **Sập sàn 3 tầng:** Đếm ngược thu hẹp sàn đấu, từng mảng sàn ngoài rung lắc cảnh báo đỏ rồi vỡ rơi xuống vực.
- **MC Giọng nói Tiếng Việt (Web Speech TTS):** Tự động đọc tên người tặng quà, hô chúc mừng vô địch, kèm thẻ vinh danh + phụ đề sóng âm và lời kêu gọi tặng quà định kỳ.
- **Bảng Quà & Chế độ OBS 9:16 sạch:** Hiển thị bảng quà trực tiếp trên sân khấu, hỗ trợ ẩn bảng điều khiển để đưa thẳng vào **OBS Studio / TikTok LIVE Studio**.

## Chạy cục bộ
Chạy một HTTP server tĩnh bất kỳ trong thư mục dự án:

```bash
python -m http.server 8766
```

Sau đó mở trình duyệt tại `http://localhost:8766/`.

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
Game cung cấp sẵn API toàn cục `window.RingDropAPI` để tích hợp với **TikFinity** hoặc **`tiktok-live-connector`**:

```js
window.RingDropAPI.onComment('Minh Anh');
window.RingDropAPI.onFollow('Khang Vũ');
window.RingDropAPI.onLike();
window.RingDropAPI.onGift('Khánh Linh', 'rose' | 'bomb' | 'collapse' | 'titan');
```
