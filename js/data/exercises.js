/**
 * Exercise database. Single source of truth for every move the app prescribes.
 *
 * Each exercise has:
 *  - id          : stable identifier (used in plan blocks + history)
 *  - name        : Vietnamese display name
 *  - type        : EXERCISE_TYPE enum
 *  - mode        : 'time' | 'reps' | 'reps-per-side'
 *  - defaultSets : suggested set count when prescribed
 *  - defaultReps : reps per set (for rep-mode)
 *  - defaultDuration: seconds per set (for time-mode)
 *  - defaultRest : rest seconds between sets
 *  - cues        : short coaching cues read aloud during the set
 *  - instructions: multi-line how-to (rendered on the session screen)
 *  - safetyTags  : conditions this exercise is SAFE for
 *  - unsafeFor   : conditions to AVOID this exercise (filtered out by plan generator)
 *  - equipment   : required equipment (matched against profile.equipment)
 *  - calsPerMin  : rough calorie estimate per minute (for cardio summary)
 */

import { CONDITION as C, EQUIPMENT as E, EXERCISE_TYPE as T } from '../constants.js';
import { EXERCISE_CONTENT } from './exercises-content.js';

/**
 * EX() merges:
 *   1. sane defaults (sets, rest, equipment, ...)
 *   2. the per-exercise definition you pass in
 *   3. enriched tutorial content from exercises-content.js (if present for this id)
 *
 * Result is frozen so views can never mutate it accidentally.
 */
const EX = (def) => {
  const enrichment = EXERCISE_CONTENT[def.id] ?? {};
  return Object.freeze({
    defaultSets: 3, defaultRest: 45, equipment: [], unsafeFor: [], safetyTags: [], cues: [],
    ...def,
    ...enrichment,
  });
};

export const EXERCISES = Object.freeze({
  // ==================== WARM-UP / CARDIO ====================
  'walk-warmup': EX({
    id: 'walk-warmup', name: 'Đi bộ khởi động', type: T.WARMUP, mode: 'time',
    defaultDuration: 300, defaultSets: 1, defaultRest: 0,
    instructions: 'Lên máy chạy bộ. Tốc độ 3.5–4.0 km/h, độ dốc 0%. Đi thư thái cho người ấm lên, lắc nhẹ vai và xoay cổ tay.',
    cues: ['Hít thở sâu', 'Thả lỏng vai'],
    equipment: [E.TREADMILL], calsPerMin: 4,
    safetyTags: [C.CORE_EASY, C.BACK_EASY, C.KNEE_EASY],
  }),
  'walk-zone2': EX({
    id: 'walk-zone2', name: 'Đi bộ nhanh có dốc (Zone 2)', type: T.CARDIO, mode: 'time',
    defaultDuration: 1500, defaultSets: 1, defaultRest: 0,
    instructions: 'Tốc độ 5.5–6.0 km/h, độ dốc 3–5%. Mục tiêu: nhịp tim ~120–140, vẫn nói chuyện được nhưng không hát nổi. Đây là vùng đốt mỡ tốt nhất.',
    cues: ['Giữ nhịp đều', 'Hít mũi - thở miệng', 'Đừng bám tay vịn'],
    equipment: [E.TREADMILL_INCLINE, E.TREADMILL], calsPerMin: 8,
    safetyTags: [C.CORE_EASY],
  }),
  'walk-zone2-long': EX({
    id: 'walk-zone2-long', name: 'Đi bộ dốc dài (đốt mỡ)', type: T.CARDIO, mode: 'time',
    defaultDuration: 2100, defaultSets: 1, defaultRest: 0,
    instructions: 'Tốc độ 5.0–5.5 km/h, độ dốc 5–8%. Buổi cardio dài, cường độ vừa, đốt mỡ là chính. Uống nước giữa chừng nếu cần.',
    cues: ['Bước dài, gót chạm trước', 'Thẳng lưng'],
    equipment: [E.TREADMILL_INCLINE], calsPerMin: 9,
    safetyTags: [C.CORE_EASY],
  }),
  'walk-cooldown': EX({
    id: 'walk-cooldown', name: 'Đi bộ thả lỏng', type: T.COOLDOWN, mode: 'time',
    defaultDuration: 300, defaultSets: 1, defaultRest: 0,
    instructions: 'Tốc độ 3.0–3.5 km/h, dốc 0%. Hít thở sâu để hạ nhịp tim. Lắc tay, xoay vai.',
    cues: ['Hít sâu', 'Thả lỏng'],
    equipment: [E.TREADMILL], calsPerMin: 3,
    safetyTags: [C.CORE_EASY, C.BACK_EASY, C.KNEE_EASY],
  }),

  // ==================== CORE (low-impact) ====================
  'dead-bug': EX({
    id: 'dead-bug', name: 'Dead Bug', type: T.CORE, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 30,
    instructions: 'Nằm ngửa, hai tay đưa thẳng lên trần, gối co 90°. Hạ tay phải về sau đầu + duỗi chân trái xuống cùng lúc, giữ lưng dưới ÉP SÁT sàn. Đổi bên. Thở ra khi hạ.',
    cues: ['Lưng dưới ép sàn', 'Thở ra khi hạ', 'Chậm rãi'],
    equipment: [E.YOGA_MAT], calsPerMin: 3,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'bird-dog': EX({
    id: 'bird-dog', name: 'Bird Dog', type: T.CORE, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 30,
    instructions: 'Quỳ 4 chi (tay dưới vai, gối dưới hông). Đưa tay phải + chân trái duỗi thẳng cùng lúc, giữ thân ngang. Giữ 1–2 giây rồi hạ. Đổi bên. Đừng để hông xoay.',
    cues: ['Thân ngang', 'Đừng xoay hông', 'Siết bụng'],
    equipment: [E.YOGA_MAT], calsPerMin: 3,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'pelvic-tilt': EX({
    id: 'pelvic-tilt', name: 'Nghiêng xương chậu', type: T.CORE, mode: 'reps',
    defaultSets: 3, defaultReps: 15, defaultRest: 30,
    instructions: 'Nằm ngửa, gối co. Hóp bụng nhẹ để ép lưng dưới sát sàn (như xoá khoảng cách giữa lưng và mặt sàn). Giữ 2 giây rồi thả. Tập trung dùng cơ bụng dưới.',
    cues: ['Hóp bụng', 'Lưng ép sàn', 'Đừng nín thở'],
    equipment: [E.YOGA_MAT], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'side-plank-knee': EX({
    id: 'side-plank-knee', name: 'Plank nghiêng (gối)', type: T.CORE, mode: 'time',
    defaultSets: 3, defaultDuration: 20, defaultRest: 30,
    instructions: 'Nằm nghiêng, chống khuỷu tay (vai thẳng trên khuỷu), gối co lại. Nâng hông lên thành đường thẳng từ đầu đến gối. Giữ. Đổi bên giữa các set.',
    cues: ['Hông cao', 'Đừng cong người'],
    equipment: [E.YOGA_MAT], calsPerMin: 4,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'plank-knee': EX({
    id: 'plank-knee', name: 'Plank đầu gối', type: T.CORE, mode: 'time',
    defaultSets: 3, defaultDuration: 30, defaultRest: 30,
    instructions: 'Quỳ gối, chống khuỷu tay xuống sàn (khuỷu dưới vai). Người tạo đường thẳng từ vai đến gối. Siết bụng và mông, đừng để hông xệ.',
    cues: ['Hông không xệ', 'Siết bụng', 'Thở đều'],
    equipment: [E.YOGA_MAT], calsPerMin: 4,
    safetyTags: [C.CORE_EASY, C.BACK_EASY],
  }),
  'glute-bridge': EX({
    id: 'glute-bridge', name: 'Cầu mông', type: T.LOWER, mode: 'reps',
    defaultSets: 3, defaultReps: 15, defaultRest: 30,
    instructions: 'Nằm ngửa, gối co, bàn chân sát mông. Siết mông đẩy hông lên, vai-hông-gối thành đường thẳng. Giữ 1 giây trên đỉnh, hạ xuống nhẹ nhàng.',
    cues: ['Siết mông trên đỉnh', 'Đừng ưỡn lưng'],
    equipment: [E.YOGA_MAT], calsPerMin: 3,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),

  // ==================== LOWER BODY ====================
  'bw-squat': EX({
    id: 'bw-squat', name: 'Squat tay không', type: T.LOWER, mode: 'reps',
    defaultSets: 3, defaultReps: 12, defaultRest: 45,
    instructions: 'Đứng rộng bằng vai, mũi chân hơi xoay ngoài. Hạ mông xuống như ngồi ghế, đến khi đùi GẦN song song sàn (không cần xuống tận đáy nếu thấy căng bụng). Gối hướng theo mũi chân, KHÔNG lao về trước. THỞ RA khi đẩy gót lên. Tuyệt đối không nín thở rặn.',
    cues: ['Xuống vừa phải', 'Mông đẩy ra sau', 'Thở ra khi đẩy lên', 'Đừng nín thở'],
    equipment: [], calsPerMin: 5,
    safetyTags: [C.CORE_EASY, C.CORE_MIN],
    unsafeFor: [C.KNEE_EASY],
  }),
  'reverse-lunge': EX({
    id: 'reverse-lunge', name: 'Lunge lùi sau', type: T.LOWER, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 45,
    instructions: 'Đứng thẳng, bước CHÂN PHẢI lùi ra sau, hạ gối phải gần chạm sàn. Đẩy gót chân trái lên về tư thế ban đầu. Đổi bên. Lùi sau dễ hơn cho gối so với lunge tới trước.',
    cues: ['Gối trước thẳng góc', 'Thân thẳng'],
    equipment: [], calsPerMin: 5,
    safetyTags: [C.CORE_EASY],
    unsafeFor: [C.CORE_MIN],
  }),
  'standing-calf': EX({
    id: 'standing-calf', name: 'Nhón gót đứng', type: T.LOWER, mode: 'reps',
    defaultSets: 3, defaultReps: 20, defaultRest: 30,
    instructions: 'Đứng thẳng, có thể bám tường để giữ thăng bằng. Nhón gót cao hết cỡ, giữ 1 giây trên đỉnh, hạ xuống có kiểm soát. Cảm nhận bắp chân siết.',
    cues: ['Lên cao hết cỡ', 'Hạ chậm'],
    equipment: [], calsPerMin: 3,
    safetyTags: [C.CORE_EASY, C.CORE_MIN],
  }),
  'wall-sit': EX({
    id: 'wall-sit', name: 'Ngồi tường', type: T.LOWER, mode: 'time',
    defaultSets: 3, defaultDuration: 30, defaultRest: 45,
    instructions: 'Tựa lưng vào tường, trượt xuống đến khi đùi song song sàn (như ngồi ghế tưởng tượng). Gối thẳng góc 90°. Giữ. Thở đều.',
    cues: ['Đùi song song sàn', 'Thở đều', 'Đừng nín thở'],
    equipment: [], calsPerMin: 4,
    safetyTags: [C.CORE_EASY],
    unsafeFor: [C.KNEE_EASY],
  }),
  'step-up-chair': EX({
    id: 'step-up-chair', name: 'Bước lên ghế', type: T.LOWER, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 45,
    instructions: 'Đứng trước 1 ghế ổn định (ghế gỗ chắc, không có bánh xe). Đặt CẢ bàn chân trái lên mặt ghế. Đẩy gót trái, đứng thẳng lên ghế (chân phải kéo theo). Bước chân phải xuống nhẹ, rồi chân trái. Đổi bên giữa các set. THỞ ĐỀU, không nín hơi.',
    cues: ['Cả bàn chân lên ghế', 'Đẩy bằng gót', 'Bước xuống nhẹ', 'Thở đều'],
    equipment: [], calsPerMin: 5,
    safetyTags: [C.CORE_EASY, C.CORE_MIN],
    unsafeFor: [C.KNEE_EASY],
  }),
  'split-squat-assisted': EX({
    id: 'split-squat-assisted', name: 'Squat 1 chân có vịn', type: T.LOWER, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 45,
    instructions: 'Đứng cạnh tường hoặc ghế, 1 tay vịn nhẹ để giữ thăng bằng. Bước chân phải lùi 1 bước dài, gót phải nhấc khỏi sàn (như đang đi giày bước hụt). Hạ gối phải xuống ~30-45° (KHÔNG cần chạm sàn), gối trái gập theo. Đẩy gót trái lên. Hết set đổi chân. Thở đều, biên độ vừa phải nếu thấy căng bụng.',
    cues: ['Vịn nhẹ giữ thăng bằng', 'Hạ vừa phải', 'Đẩy bằng gót trước', 'Thở đều'],
    equipment: [], calsPerMin: 5,
    safetyTags: [C.CORE_EASY, C.CORE_MIN],
    unsafeFor: [C.KNEE_EASY],
  }),

  // ==================== UPPER BODY ====================
  'wall-pushup': EX({
    id: 'wall-pushup', name: 'Hít đất tường', type: T.UPPER, mode: 'reps',
    defaultSets: 3, defaultReps: 12, defaultRest: 30,
    instructions: 'Đứng cách tường 1 cánh tay, đặt tay rộng bằng vai lên tường. Hạ ngực vào tường, đẩy ra. Người thẳng từ đầu đến gót. Thở ra khi đẩy.',
    cues: ['Người thẳng', 'Thở ra khi đẩy'],
    equipment: [], calsPerMin: 4,
    safetyTags: [C.CORE_EASY, C.CORE_MIN],
  }),
  'knee-pushup': EX({
    id: 'knee-pushup', name: 'Hít đất quỳ gối', type: T.UPPER, mode: 'reps',
    defaultSets: 3, defaultReps: 8, defaultRest: 45,
    instructions: 'Quỳ gối, tay rộng hơn vai một chút. Hạ ngực gần sát sàn, đẩy lên. Người thẳng từ đầu đến gối. THỞ ĐỀU — không nín thở.',
    cues: ['Khuỷu 45°', 'Thở ra khi đẩy', 'Người thẳng'],
    equipment: [E.YOGA_MAT], calsPerMin: 5,
    safetyTags: [C.CORE_EASY],
    unsafeFor: [C.CORE_MIN],
  }),
  'incline-pushup': EX({
    id: 'incline-pushup', name: 'Hít đất nghiêng (chống ghế/bàn)', type: T.UPPER, mode: 'reps',
    defaultSets: 3, defaultReps: 10, defaultRest: 45,
    instructions: 'Đặt tay lên ghế/bàn vững, người tạo góc nghiêng. Càng đứng cao càng dễ. Hạ ngực gần mép, đẩy lên. Thở ra khi đẩy.',
    cues: ['Người thẳng', 'Thở ra khi đẩy'],
    equipment: [], calsPerMin: 5,
    safetyTags: [C.CORE_EASY],
    unsafeFor: [C.CORE_MIN],
  }),
  'shoulder-tap': EX({
    id: 'shoulder-tap', name: 'Chạm vai (plank đứng tay)', type: T.UPPER, mode: 'reps-per-side',
    defaultSets: 3, defaultReps: 10, defaultRest: 30,
    instructions: 'Tư thế plank cao chống tay (hoặc plank gối). Tay phải chạm vai trái rồi đổi bên. Giữ hông không xoay.',
    cues: ['Hông không xoay', 'Siết bụng'],
    equipment: [E.YOGA_MAT], calsPerMin: 5,
    safetyTags: [C.CORE_EASY],
    unsafeFor: [C.CORE_MIN],
  }),

  // ==================== FLEXIBILITY / COOLDOWN ====================
  'cat-cow': EX({
    id: 'cat-cow', name: 'Mèo - Bò', type: T.FLEXIBILITY, mode: 'reps',
    defaultSets: 1, defaultReps: 10, defaultRest: 0,
    instructions: 'Quỳ 4 chi. Hít vào: ưỡn lưng, ngẩng đầu (bò). Thở ra: cong lưng, cúi đầu (mèo). Chậm rãi, theo hơi thở.',
    cues: ['Theo hơi thở', 'Chậm'],
    equipment: [E.YOGA_MAT], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'childs-pose': EX({
    id: 'childs-pose', name: 'Tư thế em bé', type: T.FLEXIBILITY, mode: 'time',
    defaultSets: 1, defaultDuration: 60, defaultRest: 0,
    instructions: 'Quỳ gối, mông ngồi xuống gót, người gập về trước, trán chạm sàn, tay duỗi thẳng. Thở sâu, cảm nhận lưng dưới giãn.',
    cues: ['Thở sâu', 'Thả lỏng vai'],
    equipment: [E.YOGA_MAT], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'hamstring-stretch': EX({
    id: 'hamstring-stretch', name: 'Giãn đùi sau', type: T.FLEXIBILITY, mode: 'time',
    defaultSets: 1, defaultDuration: 60, defaultRest: 0,
    instructions: 'Ngồi duỗi thẳng 1 chân, chân kia gập vào trong. Gập người về trước với tay chạm mũi chân. Đổi bên giữa chừng. Không nẩy — giữ tĩnh.',
    cues: ['Không nẩy', 'Thở đều'],
    equipment: [E.YOGA_MAT], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'hip-flexor-stretch': EX({
    id: 'hip-flexor-stretch', name: 'Giãn cơ gập hông', type: T.FLEXIBILITY, mode: 'time',
    defaultSets: 1, defaultDuration: 60, defaultRest: 0,
    instructions: 'Quỳ 1 chân (gối phải xuống sàn), chân trái đặt phía trước gập 90°. Đẩy hông về trước, cảm nhận đùi trước+hông phải giãn. Đổi bên.',
    cues: ['Đẩy hông tới', 'Thân thẳng'],
    equipment: [E.YOGA_MAT], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY],
  }),
  'shoulder-stretch': EX({
    id: 'shoulder-stretch', name: 'Giãn vai + ngực', type: T.FLEXIBILITY, mode: 'time',
    defaultSets: 1, defaultDuration: 45, defaultRest: 0,
    instructions: 'Đan tay sau lưng, ngực ưỡn về trước, vai kéo về sau. Giữ. Tiếp: đan tay phía trước, đẩy về xa, lưng cong nhẹ. Giữ.',
    cues: ['Thở đều', 'Không gồng'],
    equipment: [], calsPerMin: 2,
    safetyTags: [C.CORE_EASY, C.CORE_MIN, C.BACK_EASY, C.KNEE_EASY],
  }),
});

/** All exercise IDs as a sorted array (for debug/UI). */
export const ALL_EXERCISE_IDS = Object.freeze(Object.keys(EXERCISES));

/** @param {string} id */
export function getExercise(id) {
  const ex = EXERCISES[id];
  if (!ex) throw new Error(`Unknown exercise id: ${id}`);
  return ex;
}
