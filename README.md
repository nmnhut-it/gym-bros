# GymBros 🔥

Web app tập gym tại nhà — chạy trên đt + smart TV, lưu localStorage, không cần backend.

Tự lập lịch tuần dựa trên profile (giới tính, cân nặng, mục tiêu, lưu ý sức khoẻ, thiết bị có sẵn) — có **chế độ tập nhẹ vùng bụng (low-impact-core)** giữ áp lực ổ bụng thấp, phù hợp người mới tập / cần phục hồi.

## Tính năng

- **Onboarding wizard** — 7 bước nhập profile + chọn mục tiêu/thiết bị/lưu ý
- **Plan generator** — tạo lịch 7 ngày tự động, scale theo trình độ
- **Dashboard "favorites-first"** — pin bài hay tập (⭐), bấm 1 phát chạy luôn; hero "Tập tiếp" tự gợi lại bài bạn vừa làm; plan chỉ là 1 dòng phụ. App không ép theo lịch tuần — bạn chọn 1-2 bài là chạy.
- **Session player** — full-screen guided workout: TTS đếm rep tiếng Việt, chuông báo nghỉ, đếm ngược 3-2-1. Chạm vào màn nghỉ (hoặc nút "Bỏ qua nghỉ") để qua ngay; set cuối không bắt nghỉ vô ích
- **Ad-hoc launch** — pick từ favorites/recents/browse → chạy đúng 1-2 bài bạn chọn, không ép thêm warmup/cooldown, giữ đúng defaults bài (không bị scale xuống 3×11)
- **Weight tracker** — biểu đồ cân nặng (canvas, không thư viện)
- **Lịch sử buổi tập** + streak ngày liên tiếp
- **TV mode** — chữ to gấp 2 lần, cho m mở trên smart TV vừa tập vừa nhìn
- **Low-impact-core mode**: dead bug, bird dog, plank gối thay vì sit-up; squat/push-up bodyweight không tải nặng; mọi cue nhắc thở đều, không nín thở rặn
- **PWA** — cài như app native trên đt (Android/Chrome có nút Install, iOS Safari → Add to Home Screen). Có icon riêng + chạy fullscreen + offline-first
- **Wake lock** — màn hình không tự tắt giữa chừng buổi tập

## Chạy local

```bash
# 1. Vào thư mục
cd D:/gym-bros

# 2. Khởi server local (cần Node)
npm run dev          # http://localhost:5173
# hoặc
npm run lan          # mở trên LAN — vào từ đt qua IP máy:5173
```

Yêu cầu: trình duyệt hiện đại (Chrome/Edge/Safari/Firefox 90+). ES modules cần được serve qua HTTP — KHÔNG mở bằng `file://` (bị CORS chặn).

### Mở trên đt qua wifi

```bash
npm run lan
```

Sau đó tìm IP máy (`ipconfig` trên Windows) và mở `http://<IP>:5173` trên đt.

### Mở trên smart TV

Tương tự — dùng browser của TV (WebOS, Tizen, Android TV Chrome đều OK), gõ URL LAN. Bật **TV mode** trong Cài đặt cho chữ to.

### Cài như app native trên đt (PWA)

- **Android Chrome / Edge / Samsung Internet**: mở `gym.nmnhut.dev`, đợi banner "Add to Home Screen" hoặc menu ⋮ → Cài đặt ứng dụng. Sau đó vào Cài đặt trong app → "Cài về máy".
- **iPhone Safari**: nút Share (mũi tên hộp) → "Add to Home Screen". iOS không hỗ trợ install banner native nhưng vẫn pinned ra Home Screen + chạy fullscreen.
- Sau khi cài: chạy không cần browser, không cần mạng (đã cache shell + assets), wake lock giữ màn hình sáng giữa buổi tập.

## Deploy lên Cloudflare Pages

Tận dụng free tier (unlimited bandwidth, custom domain free).

```bash
# Lần đầu — login Cloudflare qua browser
npx wrangler login

# Deploy
npm run deploy
```

Custom domain `gym.nmnhut.dev`: vào Cloudflare dashboard → Pages → project gym-bros → Custom domains → thêm `gym.nmnhut.dev`. DNS auto.

## Cấu trúc

```
D:/gym-bros/
├── index.html              # entry — chỉ import js/app.js
├── manifest.json           # PWA manifest (name, icons, theme, display)
├── sw.js                   # service worker (offline cache, stale-while-revalidate)
├── icons/                  # icon.svg + maskable.svg (Android adaptive)
├── styles/main.css         # 1 file CSS, layered, có TV mode
├── js/
│   ├── app.js              # bootstrap
│   ├── constants.js        # ENUMS, ROUTES, DEFAULTS, PWA paths
│   ├── storage.js          # localStorage wrapper
│   ├── state.js            # global state + setters + migrateProfile
│   ├── router.js           # hash router
│   ├── wake-lock.js        # screen wake lock during session
│   ├── pwa/
│   │   └── install.js      # SW register + beforeinstallprompt capture
│   ├── data/
│   │   ├── exercises.js    # exercise database
│   │   └── templates.js    # day templates
│   ├── plan/
│   │   └── generator.js    # generatePlan(profile) — pure function
│   ├── audio/
│   │   ├── speech.js       # TTS (Web Speech API)
│   │   └── sound.js        # beep/chime (Web Audio)
│   ├── ui/
│   │   ├── dom.js          # el(), button(), card(), icon()
│   │   └── format.js       # định dạng số, thời gian
│   └── views/
│       ├── _nav.js         # tabbar
│       ├── onboarding.js   # wizard
│       ├── dashboard.js    # màn chính
│       ├── plan.js         # lịch tuần
│       ├── session.js      # player
│       ├── progress.js     # chart cân nặng
│       └── settings.js     # cài đặt (có install card)
└── package.json            # chỉ dev scripts + jsdom (test)
```

## An toàn — Disclaimer

App này **không thay thế PT** hoặc lời khuyên y tế. Khi có chấn thương / vấn đề sức khoẻ, hỏi bác sĩ trước.

- App filter loại các bài tải nặng / nín thở rặn / bụng full crunch dưới chế độ tập nhẹ vùng bụng
- Đau là **dừng ngay**
- Khi không chắc về tình trạng sức khoẻ → khám trước khi tập

Bài thuộc nhóm low-impact-core: `dead-bug`, `bird-dog`, `pelvic-tilt`, `plank-knee`, `side-plank-knee`, `glute-bridge`, `cat-cow`, đi bộ.

## License

MIT — fork thoải mái. Nếu bán bản thương mại thì đừng dùng tên "GymBros" vì t đang giữ.
