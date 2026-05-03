# Evidence base — exercise science underpinning GymBros

This document is the canonical reference for *why* the app prescribes what it
prescribes. When you change defaults, exercise lists, or coaching cues, check
this file first. When the science changes, update this file and the code in
the same commit.

Last reviewed: 2026-05-03.

---

## 1. Resistance training prescription

### ACSM 2026 Position Stand (canonical — first major update since 2009)

The American College of Sports Medicine published a new *Position Stand* in
2026 synthesising 137 systematic reviews covering 30,000+ participants
([ACSM 2026 announcement](https://acsm.org/resistance-training-guidelines-update-2026/),
[full Position Stand on PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/)).

Key prescriptions for **healthy novice adults** (our user persona):

| Variable      | Recommendation                          |
| ------------- | --------------------------------------- |
| Sets          | 1–3 per exercise                        |
| Reps          | 8–12 at ~70% 1RM                        |
| Rest          | **60–120 seconds**                      |
| Frequency     | 2–3× / week per major muscle group      |
| Tempo         | Controlled — emphasis on technique      |

**Headline finding:** *"the most meaningful gains come from a simple shift —
moving from no resistance training to any form of resistance training"*. Volume
and exotic protocols are secondary to **showing up**. This is the strongest
argument we have for the app's "tap-favorite-and-go" UX over plan rigidity.

### Implications for our defaults

- Compound moves (squat, lunge, push-up variants): rest **≥ 60s**.
- Single-joint / stability work (dead-bug, bird-dog, glute-bridge,
  pelvic-tilt): 30–45s is fine — these are low-load endurance work, not
  hypertrophy.
- Rep ranges 8–15 are all evidence-supported for general fitness; the exact
  number matters less than effort + consistency.

---

## 2. Cardio for fat loss

### The 12-3-30 protocol (12% incline, 3 mph / ~4.8 km/h, 30 min)

A 2025 peer-reviewed study in the *International Journal of Exercise Science*
directly tested 12-3-30 against self-paced treadmill running
([PMC 11798546](https://pmc.ncbi.nlm.nih.gov/articles/PMC11798546/)):

- **Calorie burn ≈ self-paced run** (no significant difference).
- **Substrate use:** 12-3-30 derived **41% of energy from fat** vs. a
  significantly lower fraction during running.
- **Mechanical load:** dramatically lower joint impact than running.

This is essentially the strongest evidence-backed treadmill protocol for our
user — male, BMI ~26.6, knees fine but not bulletproof, treadmill at home,
fat-loss goal.

### Zone 2 (heart rate ~120–140 bpm)

Independent of the 12-3-30 framing, Zone 2 cardio is the defensible "long,
slow, fat-burning" prescription. A 2025 narrative review
([Much Ado About Zone 2](https://www.fisiologiadelejercicio.com/wp-content/uploads/2025/06/Much-Ado-About-Zone-2.pdf))
concludes Zone 2 builds mitochondrial efficiency and fat oxidation capacity
without the recovery cost of HIIT. Recommended dose: **30–45 min, 3–5×/week**.

### Important caveat

> *Higher fat oxidation during a workout doesn't automatically mean more fat
> loss over time — total daily energy balance matters more than substrate
> mix during any single session.*

We will not over-promise in UI copy. "Fat-burning" framing is fine; "12-3-30
melts belly fat" is not.

### Implications for our defaults

- Add `walk-12-3-30` as a first-class cardio exercise (12% incline, 4.8 km/h,
  30 min). This becomes the default fat-loss cardio recommendation.
- Keep `walk-zone2` and `walk-zone2-long` — they cover users with treadmills
  that don't reach 12% incline, or knees that won't tolerate 12% sustained.
- Cardio is most effective when paired with resistance training (preserves
  lean mass during caloric deficit). Keep both visible on the dashboard.

---

## 3. Low-IAP / safe core training

### Core principle: breath-driven movement

Multiple sources converge on the same operational rule
([diastasisrehab.com — safe exercises](https://diastasisrehab.com/blogs/news/exercises-safe-after-incisional-hernia-and-diastasis),
[every-mother.com — what's safe](https://every-mother.com/empower/diastasis-recti-exercises-whats-safe-and-whats-not),
[postpartum DRA RCT — PMC 8136546](https://pmc.ncbi.nlm.nih.gov/articles/PMC8136546/)):

1. **Exhale initiates and supports each effort.** Breath leads the movement,
   not the other way around. This recruits the transverse abdominis (deep
   core) and dampens intra-abdominal pressure (IAP) spikes.
2. **Activate the deep core first.** "Pull the navel toward the spine" — a
   gentle drawing-in, not a hard suck. Cue must precede every set.
3. **Avoid pressure-pushing moves.** Crunches, full sit-ups, V-ups, ab-wheel
   rollouts, breath-held heavy lifts (Valsalva) — all push IAP outward
   through the linea alba. Excluded from our defaults; filtered hard against
   `CORE_EASY` / `CORE_MIN`.
4. **Pressure should be distributed, not concentrated.** Visible doming of
   the abdomen during a set = stop, regress.

### Clinical evidence

A 2023 RCT in *Journal of Physiotherapy* found that **properly progressed
abdominal exercises did not worsen inter-recti distance** and did improve
core strength when executed with correct technique and breathing. The risk
isn't core training — it's *unmanaged* core training.

### Implications for our defaults

- Every exercise that recruits the trunk under load (push-up variants,
  squat, lunge, plank, bridge) MUST carry an explicit breath cue: at minimum
  *"thở ra khi gắng sức"* or *"không nín thở"*.
- Core exercises additionally need a TVA-activation cue: *"hóp bụng nhẹ —
  rốn về cột sống"*.
- Pelvic-tilt, dead-bug, bird-dog, side-plank-knee, glute-bridge, plank-knee
  are the validated low-IAP starter set — keep all six.
- Consider adding a **diaphragmatic breathing** primer (60–90s, lying
  supine) as an optional warmup. Pure TVA + breath rehearsal, zero load.

---

## 4. Progressive overload

### Linear progression for novices

Beginners progress fastest with a simple loop: same routine for 4–6 weeks,
add **one rep per set** when all sets clean, add load (or regress to a
harder variant) when the rep ceiling is reached
([liftandnurture.com — beginner LP](https://liftandnurture.com/how-to-implement-progressive-overload-for-beginners-without-stalling-your-progress/),
[hevyapp.com — tracking](https://www.hevyapp.com/progressive-overload/)).

**Practical rule** for bodyweight work (no external load to add):

1. Hit target reps × all sets with clean form.
2. Next session: add 1 rep to top set.
3. When all sets reach the upper rep cap (e.g. 15), progress to the
   harder variant (knee-pushup → incline-pushup → standard).

### Tracking is the engine

> *"Tracking workouts is essential when applying progressive overload."*

Without records, "I think I did 12 last time?" wins, and progression stalls.

### Implications for our defaults

- Persist actual reps achieved per exercise per session.
- Surface "last time" prominently on session intro + customize sheet.
- Suggest the next-session target (last + 1 rep) but **never enforce** —
  user is final authority.
- Cap auto-suggestions at exercise's `maxReps` (when defined) before
  recommending variant progression.

---

## 5. Mobile fitness app UX — adherence + retention

Multiple 2025/2026 sources converge
([dataconomy.com — UX/UI 2025](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/),
[Springer Management Review 2025 — adherence vs. retention](https://link.springer.com/article/10.1007/s11301-025-00537-1),
[JMIR mHealth 2026 — training behavior](https://mhealth.jmir.org/2026/1/e72201)):

| Pattern                          | Effect                                      |
| -------------------------------- | ------------------------------------------- |
| Simplified onboarding            | +50% retention                              |
| First 20 seconds                 | Decides whether user stays                  |
| Visible progress                 | #1 reason users return                      |
| Empathetic copy                  | Beats harsh ("Try again tomorrow" wins)     |
| Streaks / badges                 | Reward consistency, low cost                |
| Personalisation                  | Every screen feels relevant                 |
| **Adherence ≠ Retention**        | Following the plan ≠ continuing to use app  |

### Implications for our defaults

- **Already done:** streak chip, dashboard "Tập tiếp" hero, favorite tiles,
  Vietnamese-first empathetic copy ("bro", "Tốt lắm!").
- **Gap:** no per-exercise progress visibility. Adding "Lần trước: 3×12" to
  the favorite tile + customize sheet hits the #1 retention lever.
- **Gap:** no in-app personalisation knob beyond onboarding. Letting users
  edit per-exercise sets/reps/rest fixes this without bloating settings.
- **Anti-pattern to avoid:** adding social/leaderboard features. User said
  app may be sold; community features are a separate SKU, not v0.1.

---

## 6. Mapping evidence → code

| Finding                                              | File / change                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| ACSM 60–120s rest for compound novice work           | `js/data/exercises.js` — bump `defaultRest` for compound moves |
| 12-3-30 protocol validated                           | `js/data/exercises.js` — add `walk-12-3-30`                    |
| Breath-driven core / TVA                             | `js/data/exercises.js` — cue audit                             |
| Linear progression                                   | `js/state.js` — record reps; surface "last time"               |
| Personalisation drives retention                     | `js/ui/customize-sheet.js` — per-exercise overrides            |

---

## 7. What we deliberately do NOT do (and why)

- **No 1RM testing.** Beginners get hurt; bodyweight-first defaults sidestep it.
- **No HIIT-by-default** for fat loss. Higher injury rate, recovery cost not
  matched by fat-loss benefit over Zone 2 / 12-3-30 for our user.
- **No aggressive caloric prescriptions.** Out of scope — app does training,
  not nutrition.
- **No social features.** See UX section.
- **No ab crunches / sit-ups / V-ups in the default DB.** Filtered against
  `CORE_EASY` / `CORE_MIN`. Even users without those flags don't get them
  because the defaults assume safety.

---

## Sources (verbatim links)

- [ACSM 2026 Resistance Training Guidelines](https://acsm.org/resistance-training-guidelines-update-2026/)
- [ACSM Position Stand on Resistance Training (PMC, 2026)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/)
- [12-3-30 vs self-paced running — 2025 study (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11798546/)
- [Much Ado About Zone 2 — 2025 narrative review](https://www.fisiologiadelejercicio.com/wp-content/uploads/2025/06/Much-Ado-About-Zone-2.pdf)
- [Postpartum DRA exercise intervention (PMC, 2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8136546/)
- [Safe core exercises after incisional hernia + diastasis](https://diastasisrehab.com/blogs/news/exercises-safe-after-incisional-hernia-and-diastasis)
- [Diastasis recti — what's safe and what's not](https://every-mother.com/empower/diastasis-recti-exercises-whats-safe-and-whats-not)
- [Progressive overload for beginners — linear progression](https://liftandnurture.com/how-to-implement-progressive-overload-for-beginners-without-stalling-your-progress/)
- [Hevy — progressive overload tracking guide](https://www.hevyapp.com/progressive-overload/)
- [Fitness app UX/UI 2025 — retention](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/)
- [Adherence vs retention systematic review — Springer 2025](https://link.springer.com/article/10.1007/s11301-025-00537-1)
- [JMIR mHealth — training behaviour 2026](https://mhealth.jmir.org/2026/1/e72201)
