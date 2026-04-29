# CLAUDE.md — Project guidance for AI assistants

Đây là file context cho AI khi sửa codebase này. Đọc kỹ trước khi đề xuất thay đổi.

## Project overview

GymBros = home gym web app, single-page, vanilla JS ES modules, localStorage. Target: chạy trên đt + smart TV của user người Việt thoát vị bẹn (đã mổ) muốn giảm mỡ. UI tiếng Việt. Deploy lên Cloudflare Pages tại `gym.nmnhut.dev`.

## Architecture (must understand before editing)

**Layered, no framework:**

```
constants → storage / data → state → plan-generator
                                  ↓
            audio + ui-helpers ← views ← router ← app
```

- `js/constants.js` — every enum + every magic number lives here. **Don't hardcode strings/numbers in other files.**
- `js/storage.js` — only file that touches `localStorage`. Swap this to migrate storage backends.
- `js/state.js` — single global state object + setters that auto-persist + emit `state:change`.
- `js/data/` — exercise database + day templates. Adding new exercises = ONLY edit `exercises.js`.
- `js/plan/generator.js` — **PURE FUNCTION** `(profile) → plan`. Don't touch state from here.
- `js/audio/` — TTS + Web Audio. Don't import elsewhere except views.
- `js/ui/dom.js` — `el()`, `button()`, `card()`, `icon()`. Use these instead of raw DOM API.
- `js/router.js` — hash router. Hash routing chosen so app runs from any path without server config.
- `js/views/*.js` — one file per route. Each exports `render(root)`. Views build DOM via `el()`, mount to `root`.

## Critical safety rules (DO NOT BREAK)

1. **Hernia-safe filter is non-negotiable.** Every exercise in `data/exercises.js` MUST declare `unsafeFor` if it raises intra-abdominal pressure. Plan generator filters these out for users with `CONDITION.HERNIA_*`.
2. **Never add full sit-ups, V-ups, ab-wheel rollouts, deadlifts, heavy squats** to default plans. They're banned for the primary user.
3. **TTS coaching cues must remind to breathe ("thở đều", "thở ra khi đẩy")** — Valsalva (nín thở rặn) is dangerous for hernia + high BP users.

## Code rules (from user's global CLAUDE.md)

- **Strict DRY** — search before adding. View helpers go in `ui/dom.js` if reusable.
- **Method ≤ 30 lines.** Split if longer.
- **No hardcoded strings/numbers.** Add to `constants.js` or use existing enum.
- **No `Map<string, X>`-with-string-keys-as-config** patterns. Use frozen objects with typed keys.
- **JSDoc on public functions** — VSCode autocomplete is the type system.
- **Brief in-code docs only**, ≤ 200 words, plain English. No giant block comments.
- **Update README.md + IMPLEMENTATION_PLAN.md** when shipping a feature.

## Testing approach (when added)

- Unit tests: `plan/generator.js` is the highest-value target — pure function, deterministic.
- E2E: golden path with Playwright = onboarding → start session → finish 1 block → verify session record saved.
- **Do not read test console output directly.** Dump to file, grep. Spawn agent to wait + analyze.

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
npm run dev                        # local, port 5173
npm run lan                        # bind 0.0.0.0 for phone/TV testing
npm run deploy                     # Cloudflare Pages (needs wrangler login first)
```
