# IMPLEMENTATION PLAN

Sống tài liệu — cập nhật mỗi lần ship 1 milestone.

## Hiện trạng (2026-04-30)

✅ **Phase 1: Local MVP** — DONE
- Cấu trúc modular ES modules
- Onboarding 7 bước
- Plan generator với hernia-safe filter + level scaling + equipment fallback
- Exercise DB 25 bài (cardio, core, lower, upper, flexibility)
- 4 day templates (cardio-core, strength-light, cardio-long, recovery)
- 4 weekly schedules (3/4/5/6 days/week)
- Session player: state machine intro → active → rest → next, TTS đếm rep VI, chuông + beep, countdown 3-2-1
- Dashboard: today card, streak, weekly stats, quick weight log, **Tập nhanh** + **Tự chọn bài** entry
- Plan view: 7 ngày breakdown
- Progress: weight chart (vanilla canvas), session history
- Settings: edit profile, replan, audio, TV mode, reset
- TV mode: scale up font 2x
- 14 unit tests (plan + quick session, hernia safety)

✅ **JTBD coverage** (theo feedback 2026-04-29):
- JTBD-1 today's plan ✅
- JTBD-2 Quick Session (focus + duration) ✅
- JTBD-3 Browse library + custom builder ✅
- JTBD-4 Exercise reference (tutorial sheet, sources, common mistakes) ✅
- JTBD-5 Ad-hoc external activity log ❌ todo
- JTBD-6 Swap mid-session ✅
- JTBD-7 Adjust health condition post-onboarding ❌ todo

✅ **Visual + content polish**
- Multi-pose stick-figure animations
- Real-people photo demos cho 14 bài (yuhonas/free-exercise-db, Unlicense)
- Detailed steps + muscles worked + common mistakes + safety notes + sources cho mỗi bài

## Phase 2: Polish + deploy (next)

- [ ] JTBD-5: ad-hoc log "đã chạy bộ ngoài 30 phút" → vào streak/stats
- [ ] JTBD-7: Settings card "Tình trạng sức khoẻ" cho phép sửa `conditions[]` post-onboarding, auto replan
- [ ] Test thực tế: chạy 1 buổi đầy đủ trên đt, ghi nhận bug/UX
- [ ] Test TV browser (WebOS/Tizen) compatibility — fallback nếu Web Speech không có
- [ ] PWA: thêm `manifest.json` + service worker để cài như app native trên đt
- [ ] Wakelock API: giữ màn hình sáng khi đang tập
- [x] Cloudflare Workers Static Assets deploy → `https://gym-bros.nmnhut-en.workers.dev/` (live 2026-04-30)
- [x] GitHub repo + auto-deploy hook (push to main → Cloudflare rebuilds)
- [x] Custom domain `https://gym.nmnhut.dev/` (live 2026-04-30, SSL auto-provisioned)

## Phase 3: Multi-profile

- [ ] Settings → "Tạo profile khác" — vợ/con/bạn cùng chia sẻ thiết bị
- [ ] Profile switcher trên header
- [ ] Migration: `gymbros:profile` → `gymbros:profiles[]` + `activeProfileId`

## Phase 4: Cloud sync (cho việc bán app)

- [ ] Cloudflare D1 schema: users, profiles, sessions, weights
- [ ] Magic-link auth: Workers + Resend (free tier)
- [ ] Sync engine: localStorage = source of truth, push delta lên server, pull khi đổi máy
- [ ] Conflict resolution: last-write-wins per record (đơn giản đủ cho usecase)

## Phase 5: AI Coach (premium tier)

- [ ] Mỗi tuần: nhìn 7 ngày qua + cân nặng → gọi Claude API tạo gợi ý điều chỉnh
- [ ] "Bài này m làm sai gì?" — m mô tả, AI fix kỹ thuật
- [ ] Tự động giảm/tăng cường độ dựa lịch sử compliance
- [ ] Premium $4.99/tháng, free tier giới hạn 5 lượt AI/tháng

## Phase 6: Content expansion

- [ ] Video clip cho từng bài (host R2, free egress)
- [ ] Bài tập kèm tạ tay / dây kháng lực / xà đơn (cho người có thiết bị thêm)
- [ ] Yoga / mobility flow riêng
- [ ] HIIT mode (interval timer cấu hình)

## Phase 7: Community

- [ ] Share progress card sang social (image generator)
- [ ] Workout templates công khai — m tạo plan riêng share cho friends
- [ ] Leaderboard streak (opt-in)

## Tech debt + ideas

- Replace inline SVG icons with a proper icon system khi count > 30
- Migrate to TypeScript khi codebase >5k lines (giờ ~1.5k, vẫn ổn với JSDoc)
- Unit tests cho `plan/generator.js` — pure function nên dễ test
- E2E test với Playwright cho golden path: onboarding → start session → finish → check history
- i18n: tách string ra `i18n/vi.js` + `i18n/en.js` (rule global của user yêu cầu rồi)

## Decisions log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-29 | Vanilla JS + ES modules thay React/Next | Zero dep, chạy TV browser tốt, dễ deploy static, đủ cho scope |
| 2026-04-29 | localStorage thay IndexedDB | Đủ cho 1 user, dễ debug, swap sau qua `storage.js` |
| 2026-04-29 | Hash routing thay History API | Chạy được từ file:// và subfolder không cần server config |
| 2026-04-29 | Vietnamese-first UI | Target user là m + bạn người Việt; i18n later |
| 2026-04-29 | Subdomain `gym.nmnhut.dev` thay path trên blog | Tách biệt với Hugo blog, deploy độc lập |
| 2026-04-29 | Filter hernia-unsafe ở plan generator thay UI | Tránh user vô tình chọn bài nguy hiểm |
| 2026-04-29 | TTS đếm rep auto thay tap-to-count | User đang tập, tay không rảnh để tap đt |
| 2026-04-30 | Nới `bw-squat` cho HERNIA_ACUTE (chỉ giữ KNEE_PAIN block) | BW squat biên độ vừa + thở đều an toàn pre-surgery; filter cũ chế quá tay. Cues mới nhấn "không xuống quá sâu", "thở ra khi đẩy lên". |
| 2026-04-30 | Thêm `step-up-chair` + `split-squat-assisted` | Mở rộng pool LOWER hernia-safe — single-leg, low-impact, có support thăng bằng. |
| 2026-04-30 | Fix bug session.js không re-boot khi đổi adHocDay giữa 2 buổi | render() so sánh `state.adHocDay !== session.day` để re-boot. |
