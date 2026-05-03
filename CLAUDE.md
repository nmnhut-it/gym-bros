# CLAUDE.md — Project guidance for AI assistants

Đây là file context cho AI khi sửa codebase này. Đọc kỹ trước khi đề xuất thay đổi.

## Project overview

GymBros = home gym web app, single-page, vanilla JS ES modules, localStorage. Chạy trên đt + smart TV. UI tiếng Việt. Deploy lên Cloudflare Pages tại `gym.nmnhut.dev`. Có chế độ low-impact-core (CORE_EASY / CORE_MIN) cho người mới tập / cần giữ áp lực ổ bụng thấp — filter ra sit-up đầy đủ, V-up, ab-wheel, deadlift, heavy squat. UI không nêu tên bệnh.

## Architecture (must understand before editing)

**Layered, no framework:**

```
constants → storage / data → state → plan-generator
                                  ↓
            audio + ui-helpers ← views ← router ← app
                                          ↑
                       pwa/install + wake-lock (platform glue)
```

- `js/constants.js` — every enum + every magic number lives here. **Don't hardcode strings/numbers in other files.**
- `js/storage.js` — only file that touches `localStorage`. Swap this to migrate storage backends.
- `js/state.js` — single global state object + setters that auto-persist + emit `state:change`. `migrateProfile()` runs on load to map legacy condition codes. Owns favorites (`toggleFavorite`, `isFavorite`), recent-exercise lookup (`getRecentExerciseIds`), and ad-hoc launch (`startAdHocFromExerciseIds` — passes IDs through `filterSafeExerciseIds` first so unsafe pinned moves can never reach the session player).
- `js/pwa/install.js` — registers `sw.js` + captures `beforeinstallprompt`. Settings shows the install card.
- `js/wake-lock.js` — acquired in `session.startSet`, released in `finish` / `confirmExit`. Auto re-acquires on visibility change.
- `manifest.json` + `sw.js` + `icons/*.svg` live at site root so SW scope is `/` and the manifest is reachable from any subpath.
- `js/bootstrap.js` — temporary `SEED_PROFILE` for v0.1 personal use; removed once onboarding redesign ships (Phase A in IMPLEMENTATION_PLAN.md).
- `js/data/` — `exercises.js` (database), `templates.js` (day templates), `exercises-content.js` (long-form how-to text), `photos.js` + `animations.js` (visual assets). Adding new exercises = ONLY edit `exercises.js`. Lookup helpers: **`getExercise(id)` throws** for unknown ids — only safe when the id comes from internal sources (templates, plan blocks). For ids from user data (favorites, recents, stale storage), use **`findExercise(id)` which returns `undefined`**.
- `js/plan/` — three **PURE FUNCTIONS**, no state mutation: `generator.js` `(profile)→weekly plan`, `quick.js` `(focus, level)→single ad-hoc session`, `builder.js` `(picked exercises)→runnable day`. Quick + builder share level-scaling logic.
- `js/audio/` — TTS (`speech.js`) + Web Audio (`sound.js`). Don't import elsewhere except views.
- `js/ui/dom.js` — `el()`, `button()`, `card()`, `icon()`. Use these instead of raw DOM API. Companions: `format.js` (số/thời gian), `tutorial.js` (how-to sheets).
- `js/router.js` — hash router. Hash routing chosen so app runs from any path without server config.
- `js/views/*.js` — one file per route (`onboarding`, `dashboard`, `plan`, `session`, `progress`, `settings`, `browse`, plus shared `_nav`). Each exports `render(root)`. Views build DOM via `el()`, mount to `root`.

## Critical safety rules (DO NOT BREAK)

1. **Low-impact-core filter is non-negotiable.** Every exercise in `data/exercises.js` MUST declare `unsafeFor` if it raises intra-abdominal pressure. Plan generator AND `state.startAdHocFromExerciseIds` (favorites/recents launch path) BOTH apply the filter — even a user-pinned exercise is dropped if it became unsafe after a profile change. Naming describes the *restriction* (avoid high IAP), not any underlying cause — UI never names a disease.
2. **Never add full sit-ups, V-ups, ab-wheel rollouts, deadlifts, heavy squats** to default plans. They're filtered out under low-impact-core.
3. **TTS coaching cues must remind to breathe ("thở đều", "thở ra khi đẩy")** — Valsalva (nín thở rặn) raises intra-abdominal pressure and is filtered against. Keep advice generic — describe the technique, not a disease.
4. **Storage migration:** legacy condition codes (`hernia-healed`, `hernia-acute`, `back-pain`, `knee-pain`, `high-bp`, `pregnancy`) auto-map to current ones via `CONDITION_MIGRATIONS` in `state.load()`. When replacing a flag, extend that map.

## Code rules (from user's global CLAUDE.md)

- **Strict DRY** — search before adding. View helpers go in `ui/dom.js` if reusable.
- **Method ≤ 30 lines.** Split if longer.
- **No hardcoded strings/numbers.** Add to `constants.js` or use existing enum.
- **No `Map<string, X>`-with-string-keys-as-config** patterns. Use frozen objects with typed keys.
- **JSDoc on public functions** — VSCode autocomplete is the type system.
- **Brief in-code docs only**, ≤ 200 words, plain English. No giant block comments.
- **Update README.md + IMPLEMENTATION_PLAN.md** when shipping a feature.

## Testing approach

Test pyramid in `tests/`:
- `plan.test.mjs` — pure-function unit tests for plan generator + quick session.
- `storage.test.mjs` — localStorage wrapper round-trip + prefix isolation.
- `state.test.mjs` — setters, persistence, profile migration (legacy condition codes → current).
- `session.test.mjs` — full state-machine integration via jsdom + node:test mock timers, stubbed Speech/Sound. Covers golden path, pause/resume, rep counter, swap, skip, multi-set+rest.
- `views.smoke.test.mjs` — every view renders without throwing under a seeded state.
- `_setup.mjs` — shared jsdom + Web Speech / Web Audio / Canvas stubs. Import this BEFORE any app module.

Conventions:
- Run via `npm test`. Each test must self-assert; never rely on visual inspection.
- Add tests for every layer a feature touches (data → state → integration → view), including the happy path.
- mock.timers.tick(N) with N > ~3000ms drops setInterval fires under Node's mock; use 100ms slices via the `advance()` helper in `session.test.mjs`.
- **Do not read test console output directly.** Dump to file, grep. Spawn an agent to wait + analyze long runs.

## Common pitfalls

- **Don't open `index.html` via `file://`** — ES modules need HTTP. Use `npm run dev`.
- **TTS voices load async** — first call to `pickVoice()` may return null. `Speech.init()` re-resolves on `voiceschanged`.
- **`speechSynthesis.cancel()` before each speak** — prevents queue buildup when user spam-clicks.
- **Audio context starts suspended** — `Sound.unlock()` must be called from user gesture (button click) before first beep.
- **Wake lock** not yet implemented — phone may sleep mid-workout. TODO Phase 2.

## What NOT to do

- Don't introduce React/Vue/Svelte. Vanilla is intentional for TV browser support + zero dep.
- Don't add bundler / build step. ES modules native = source = deploy.
- Don't remove the safety filter. Even if user manually selects an exercise, generator should refuse to schedule it.
- Don't write English UI strings. Vietnamese-first. Add i18n only when 2nd language requested.
- Don't expand exercise DB beyond what generator can use safely. Quality > quantity.

## Deploy commands

```bash
npm run dev                        # local, port 5173 (npx serve)
npm run lan                        # bind 0.0.0.0 for phone/TV testing
npm test                           # node --test tests/*.mjs (currently: tests/plan.test.mjs)
npm run deploy                     # Cloudflare Pages (needs wrangler login first)
```

Single test run: `node --test tests/plan.test.mjs`. No bundler — `index.html` imports `js/app.js` directly via native ES modules.
