/**
 * Detailed tutorial content per exercise.
 *
 * Sourced from authoritative fitness/medical references — ACE Fitness, NHS Live
 * Well, Mayo Clinic, Cleveland Clinic, NIH/PMC, Yoga Journal. Each entry cites
 * the actual source(s) consulted.
 *
 * This file is intentionally separate from `exercises.js` so the data layer
 * stays readable. At module load `exercises.js` merges these enrichments into
 * each exercise object.
 *
 * To add content for a new exercise: add an entry keyed by exercise id with
 * detailedSteps[], musclesWorked[], commonMistakes[], benefits, safetyNotes,
 * sources[].
 */

export const EXERCISE_CONTENT = Object.freeze({
  'dead-bug': {
    detailedSteps: [
      'Nằm ngửa trên thảm, hai đầu gối co 90° ngay phía trên hông, hai cánh tay duỗi thẳng lên trần, hai vai ngay dưới khớp vai.',
      'Hít vào nhẹ, kéo rốn về phía cột sống để ép lưng dưới sát thảm — giữ khung sườn ổn định, KHÔNG nín thở.',
      'Thở ra chậm, đồng thời hạ tay phải ra sau đầu và duỗi chân trái xuống cho đến khi gần chạm sàn, giữ lưng dưới luôn ép sàn.',
      'Tạm dừng 1 giây, hít vào và đưa tay/chân về vị trí ban đầu có kiểm soát.',
      'Đổi bên: hạ tay trái và chân phải. Tiếp tục xen kẽ 8–12 lần mỗi bên.',
      'Trong suốt động tác, thở đều và tự nhiên — không gồng bụng quá mạnh.',
    ],
    musclesWorked: ['Cơ ngang bụng (transverse abdominis)', 'Cơ thẳng bụng dưới', 'Cơ liên sườn', 'Cơ ổn định cột sống thắt lưng'],
    commonMistakes: [
      'Để lưng dưới cong lên khỏi thảm khi duỗi chân — tăng áp lực cột sống.',
      'Nín thở hoặc rặn mạnh (Valsalva) — phải thở đều.',
      'Hạ chân quá thấp khiến mất kiểm soát thắt lưng.',
      'Đưa tay/chân quá nhanh thay vì có kiểm soát.',
    ],
    benefits: 'Tăng cường ổn định cột sống thắt lưng và kích hoạt cơ lõi sâu mà không nén ép lưng — phù hợp cho người mới tập và phục hồi sau chấn thương.',
    safetyNotes: 'An toàn cho người sau mổ thoát vị bẹn đã lành: thở đều, không nín hơi rặn. Nếu đau lưng dưới, giảm biên độ hạ chân hoặc co gối nhiều hơn.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/147/supine-dead-bug/', name: 'ACE Fitness — Supine Dead Bug' },
      { url: 'https://www.acefitness.org/resources/everyone/blog/6313/7-core-stability-exercises/', name: 'ACE Fitness — 7 Core Stability Exercises' },
    ],
  },

  'bird-dog': {
    detailedSteps: [
      'Quỳ trên thảm ở tư thế bốn chân: hai tay dưới vai, hai gối dưới hông.',
      'Siết nhẹ cơ bụng để cột sống ở vị trí trung tính (lưng phẳng), mắt nhìn xuống sàn.',
      'Thở ra, từ từ duỗi thẳng chân trái ra sau cho đến khi song song sàn, giữ hai bên hông cân bằng.',
      'Cùng lúc đó, đưa tay phải ra trước cho đến khi song song sàn, ngón cái hướng lên.',
      'Giữ tư thế 2–3 giây, thở đều, không nín hơi.',
      'Hít vào, hạ tay/chân về vị trí ban đầu có kiểm soát. Đổi bên.',
      'Lặp lại 8–10 lần mỗi bên.',
    ],
    musclesWorked: ['Cơ dựng sống (erector spinae)', 'Cơ mông lớn', 'Cơ bụng sâu', 'Cơ vai sau'],
    commonMistakes: [
      'Để hông nghiêng sang một bên khi nâng chân — mất ổn định cột sống.',
      'Cong võng lưng dưới khi duỗi chân ra sau quá cao.',
      'Nâng tay/chân quá nhanh, không kiểm soát.',
      'Ngẩng cổ nhìn lên thay vì giữ cổ thẳng hàng cột sống.',
    ],
    benefits: 'Cải thiện ổn định cột sống thắt lưng và phối hợp tay/chân đối bên — giúp giảm đau lưng và phòng chấn thương.',
    safetyNotes: 'Phù hợp với người sau hồi phục thoát vị bẹn vì áp lực ổ bụng thấp. Chỉ nâng chân tới mức giữ được lưng phẳng; thở đều.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/', name: 'ACE Fitness — Bird Dog' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8136566/', name: 'NIH/PMC — Lumbar Multifidus During Quadruped Exercises' },
    ],
  },

  'pelvic-tilt': {
    detailedSteps: [
      'Nằm ngửa, hai gối co, bàn chân đặt phẳng trên sàn rộng bằng hông.',
      'Hai tay đặt thoải mái dọc thân hoặc nhẹ trên bụng để cảm nhận chuyển động.',
      'Thở ra nhẹ, từ từ siết cơ bụng kéo rốn xuống và xoay xương chậu về sau, ép lưng dưới sát thảm.',
      'Giữ tư thế 3–5 giây, thở đều và tự nhiên (không nín hơi).',
      'Hít vào và thả lỏng, để xương chậu trở về trung tính.',
      'Lặp lại 8–12 lần, chuyển động chậm và nhẹ nhàng.',
    ],
    musclesWorked: ['Cơ ngang bụng', 'Cơ thẳng bụng dưới', 'Cơ mông', 'Cơ sàn chậu'],
    commonMistakes: [
      'Nâng mông khỏi thảm — đó là động tác bridge, không phải pelvic tilt.',
      'Nín hơi để ép lưng xuống — phải thở đều.',
      'Dùng cơ chân/mông quá mức thay vì cơ bụng.',
      'Chuyển động giật cục.',
    ],
    benefits: 'Giảm áp lực và căng cứng lưng dưới, kích hoạt nhẹ cơ bụng sâu — bài khởi động lý tưởng cho người đau lưng.',
    safetyNotes: 'Rất an toàn cho người sau mổ thoát vị bẹn: cường độ thấp, không tạo áp lực ổ bụng. Nếu đau lưng giảm lực ép.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/7/supine-pelvic-tilts/', name: 'ACE Fitness — Supine Pelvic Tilts' },
      { url: 'https://www.mayoclinic.org/healthy-lifestyle/labor-and-delivery/multimedia/pelvic-tilt-exercise/img-20006410', name: 'Mayo Clinic — Pelvic Tilt Exercise' },
      { url: 'https://www.ncbi.nlm.nih.gov/books/NBK551558/', name: 'NIH/StatPearls — Williams Back Exercises' },
    ],
  },

  'glute-bridge': {
    detailedSteps: [
      'Nằm ngửa, gối co, bàn chân đặt phẳng cách hông ~1 bàn chân, rộng bằng hông.',
      'Tay duỗi dọc thân, lòng bàn tay úp xuống. Siết bụng nhẹ để ép lưng sát thảm.',
      'Thở ra, ép gót chân xuống sàn và từ từ nâng hông lên bằng cách siết cơ mông, tạo đường thẳng vai – hông – đầu gối.',
      'Tạm dừng 2 giây ở điểm cao nhất, thở đều, không nâng quá cao tránh ưỡn lưng.',
      'Hít vào và hạ hông xuống chậm rãi, có kiểm soát.',
      'Lặp lại 10–15 lần.',
    ],
    musclesWorked: ['Cơ mông lớn', 'Cơ mông nhỡ', 'Gân kheo (hamstrings)', 'Cơ bụng sâu'],
    commonMistakes: [
      'Nâng hông quá cao gây ưỡn lưng dưới — tăng áp lực cột sống.',
      'Đẩy bằng mũi chân thay vì gót — giảm tác động lên cơ mông.',
      'Đầu gối chụm vào nhau hoặc đổ ra ngoài — phải song song.',
      'Nín hơi rặn khi nâng — phải thở ra khi nâng.',
    ],
    benefits: 'Tăng cường cơ mông và cơ duỗi hông, cải thiện tư thế và giảm tải cho lưng dưới.',
    safetyNotes: 'An toàn sau hồi phục thoát vị bẹn: thở ra khi nâng, không nín hơi rặn. Nếu đau lưng giảm biên độ và siết bụng nhẹ trước khi nâng.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/', name: 'ACE Fitness — Glute Bridge' },
      { url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5534144/', name: 'NIH/PMC — Building a Better Gluteal Bridge (EMG)' },
    ],
  },

  'side-plank-knee': {
    detailedSteps: [
      'Nằm nghiêng phải trên thảm, hai chân chồng nhau, đầu gối co ~90°.',
      'Chống cẳng tay phải xuống thảm, khuỷu ngay dưới vai, cẳng tay vuông góc thân.',
      'Đầu, vai, hông, đầu gối thẳng hàng. Tay trái đặt lên hông hoặc duỗi dọc thân.',
      'Thở ra, siết nhẹ cơ bụng + cơ mông để nâng hông lên khỏi thảm, giữ đầu gối vẫn chạm thảm, thân tạo đường thẳng đầu → gối.',
      'Giữ 10–20 giây, thở đều, không nín hơi.',
      'Hít vào và hạ hông xuống nhẹ nhàng. Lặp lại 3–5 lần rồi đổi bên.',
    ],
    musclesWorked: ['Cơ chéo bụng (obliques)', 'Cơ vuông thắt lưng', 'Cơ mông nhỡ', 'Cơ ổn định vai'],
    commonMistakes: [
      'Hông võng xuống thảm — mất tác dụng cơ chéo bụng.',
      'Đẩy hông quá cao hoặc xoay người, không thẳng hàng.',
      'Khuỷu tay không nằm dưới vai — áp lực không cần thiết lên vai.',
      'Nín hơi để giữ tư thế — phải thở đều.',
    ],
    benefits: 'Tăng sức mạnh cơ chéo bụng và ổn định bên thân với cường độ vừa phải — biến thể nhẹ phù hợp người mới tập.',
    safetyNotes: 'Phiên bản chống đầu gối an toàn hơn cho người sau mổ thoát vị bẹn vì giảm tải ổ bụng. Thở đều; dừng nếu căng tức vùng bẹn.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/100/side-plank-modified/', name: 'ACE Fitness — Side Plank Modified' },
      { url: 'https://health.clevelandclinic.org/plank-exercise-benefits', name: 'Cleveland Clinic — Plank Exercise Benefits' },
    ],
  },

  'cat-cow': {
    detailedSteps: [
      'Tư thế bò: hai tay dưới vai, hai gối dưới hông, lưng phẳng tự nhiên.',
      'Hít vào, hạ bụng xuống sàn, ngẩng đầu và ngực lên, xương cụt hướng trần (Cow).',
      'Thở ra, cong lưng lên trần như mèo dọa, cằm hướng ngực, ép rốn về cột sống (Cat).',
      'Di chuyển chậm, nhịp nhàng theo hơi thở, mỗi nhịp ~3-4 giây.',
      'Lặp lại 8–10 lần, tập trung kéo giãn từng đốt sống.',
      'Kết thúc bằng tư thế lưng phẳng trung tính.',
    ],
    musclesWorked: ['Cơ dựng cột sống', 'Cơ bụng ngang', 'Cơ thang và cơ cổ', 'Cơ vùng chậu'],
    commonMistakes: [
      'Di chuyển quá nhanh, không đồng bộ với hơi thở.',
      'Khóa khớp khuỷu tay/đầu gối thay vì giữ thẳng tự nhiên.',
      'Đẩy vai lên gần tai thay vì giữ vai thả lỏng xa tai.',
    ],
    benefits: 'Tăng linh hoạt cột sống, giảm căng cứng lưng/cổ. Cải thiện tuần hoàn quanh đĩa đệm và làm dịu hệ thần kinh.',
    safetyNotes: 'Người đau lưng cấp/thoát vị đĩa đệm/thoát vị bụng nên thực hiện biên độ nhỏ, thở đều, tránh nín thở.',
    sources: [
      { url: 'https://www.yogajournal.com/poses/cat-pose/', name: 'Yoga Journal — Cat Pose' },
      { url: 'https://www.yogajournal.com/poses/cow-pose/', name: 'Yoga Journal — Cow Pose' },
      { url: 'https://health.clevelandclinic.org/yoga-poses-for-back-pain', name: 'Cleveland Clinic — Yoga Poses for Back Pain' },
    ],
  },

  'childs-pose': {
    detailedSteps: [
      'Quỳ trên sàn, hai ngón chân cái chạm nhau, đầu gối mở rộng bằng hông (rộng hơn nếu cần).',
      'Ngồi mông xuống gót chân, từ từ cúi thân về phía trước.',
      'Duỗi tay thẳng phía trước, lòng bàn tay úp xuống sàn.',
      'Đặt trán nhẹ lên sàn (hoặc lên gối nếu không chạm tới).',
      'Thả lỏng vai, thở sâu và đều bằng bụng trong 30–60 giây.',
      'Để thoát thế, dùng tay đẩy nhẹ và từ từ ngồi dậy.',
    ],
    musclesWorked: ['Cơ lưng dưới', 'Cơ hông và mông', 'Cơ đùi trước', 'Cơ vai và cánh tay'],
    commonMistakes: [
      'Gồng vai và cổ thay vì thả lỏng.',
      'Ép mông xuống gót khi đầu gối chưa đủ linh hoạt — gây đau.',
      'Nín thở thay vì hít sâu.',
    ],
    benefits: 'Kéo giãn nhẹ lưng dưới, hông, đùi — giảm căng thẳng và mệt mỏi. Tư thế nghỉ phục hồi an toàn.',
    safetyNotes: 'Người chấn thương đầu gối, mang thai, hoặc thoát vị nên mở rộng đầu gối + kê gối dưới bụng/ngực; tránh ép bụng.',
    sources: [
      { url: 'https://www.yogajournal.com/poses/child-s-pose/', name: "Yoga Journal — Child's Pose" },
      { url: 'https://www.nhs.uk/live-well/exercise/easy-low-impact-exercises/', name: 'NHS Live Well — Low Impact Exercises' },
    ],
  },

  'hamstring-stretch': {
    detailedSteps: [
      'Ngồi trên sàn/thảm, lưng thẳng, hai chân duỗi thẳng phía trước.',
      'Co chân trái lại, lòng bàn chân trái áp vào đùi trong chân phải.',
      'Hít vào kéo dài cột sống; thở ra, gập người về trước từ HÔNG (không gù lưng).',
      'Vươn tay về phía bàn chân phải, giữ đầu gối phải hơi mềm (không khóa khớp).',
      'Giữ 20–30 giây, cảm nhận lực kéo nhẹ ở mặt sau đùi.',
      'Thoát thế từ từ và đổi bên, lặp 2–3 lần mỗi chân.',
    ],
    musclesWorked: ['Cơ đùi sau (hamstrings)', 'Cơ bắp chân', 'Cơ lưng dưới'],
    commonMistakes: [
      'Gập bằng cách cong lưng thay vì gập từ khớp hông.',
      'Khóa khớp gối hoàn toàn — gây áp lực lên khoeo chân.',
      'Cố vươn tới mức đau thay vì giữ ở mức căng vừa phải.',
    ],
    benefits: 'Tăng linh hoạt cơ đùi sau, giảm nguy cơ chấn thương. Cải thiện tư thế và giảm đau lưng dưới do hamstring căng.',
    safetyNotes: 'Người đau lưng dưới/thoát vị đĩa đệm gập từ hông, lưng thẳng, không bật nẩy; thở đều.',
    sources: [
      { url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/stretching/sls-20076840', name: 'Mayo Clinic — Stretching Slideshow' },
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/171/seated-hamstring-stretch/', name: 'ACE Fitness — Seated Hamstring Stretch' },
      { url: 'https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-stretch-major-muscles/', name: 'NHS — How to Stretch Major Muscles' },
    ],
  },

  'hip-flexor-stretch': {
    detailedSteps: [
      'Quỳ một gối xuống sàn (gối phải), gối trước (trái) gập vuông 90°, bàn chân trái đặt phẳng.',
      'Đặt khăn hoặc đệm dưới đầu gối sau cho thoải mái.',
      'Giữ thân trên thẳng đứng, siết nhẹ cơ mông phải để xương chậu nghiêng nhẹ về sau.',
      'Đẩy hông từ từ về trước cho đến khi cảm thấy căng ở mặt trước hông và đùi phải.',
      'Giữ 20–30 giây, hít thở đều và sâu.',
      'Đổi bên và lặp 2–3 lần mỗi bên.',
    ],
    musclesWorked: ['Cơ thắt lưng chậu (iliopsoas)', 'Cơ đùi trước', 'Cơ khép háng'],
    commonMistakes: [
      'Cong lưng dưới và đẩy bụng ra trước thay vì giữ xương chậu trung tính.',
      'Để gối trước vượt quá mũi chân — áp lực lên khớp gối.',
      'Thực hiện nhanh, không siết cơ mông để bảo vệ lưng.',
    ],
    benefits: 'Giảm căng cứng cơ hông trước do ngồi nhiều, cải thiện tư thế đứng. Hỗ trợ giảm đau lưng dưới.',
    safetyNotes: 'Người đau lưng/thoát vị bẹn/thoát vị thành bụng đẩy hông NHẸ, siết mông để ổn định cột sống, tuyệt đối không nín thở.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/26/kneeling-hip-flexor-stretch/', name: 'ACE Fitness — Kneeling Hip Flexor Stretch' },
      { url: 'https://my.clevelandclinic.org/health/articles/22356-hip-flexors', name: 'Cleveland Clinic — Hip Flexors' },
    ],
  },

  'shoulder-stretch': {
    detailedSteps: [
      'Đứng thẳng, hai chân rộng bằng vai, gối hơi mềm, vai thả lỏng.',
      'Đưa hai tay ra sau lưng, đan các ngón tay vào nhau, lòng bàn tay hướng vào nhau.',
      'Duỗi thẳng hai cánh tay, ép hai bả vai lại gần nhau, mở rộng lồng ngực.',
      'Nâng nhẹ hai tay đan ra xa lưng, hướng xuống sàn; tránh ngả người ra sau.',
      'Giữ 20–30 giây, hít sâu, cảm nhận lực kéo ở ngực và vai trước.',
      'Thả tay từ từ và lặp 2–3 lần.',
    ],
    musclesWorked: ['Cơ ngực lớn', 'Cơ vai trước', 'Cơ nhị đầu cánh tay'],
    commonMistakes: [
      'Ngả thân trên ra sau hoặc cong lưng dưới để bù trừ.',
      'Nâng vai lên gần tai thay vì hạ vai và ép bả vai về sau.',
      'Khóa khớp khuỷu quá mạnh.',
    ],
    benefits: 'Mở rộng vùng ngực và vai trước, đối kháng tư thế gù do ngồi máy tính lâu. Giảm đau cổ vai gáy.',
    safetyNotes: 'Người đau vai/viêm chóp xoay/đông cứng vai giảm biên độ; không nín thở để tránh tăng áp lực ổ bụng.',
    sources: [
      { url: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/multimedia/stretching/sls-20076525', name: 'Mayo Clinic — Stretching for Flexibility' },
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/178/clasp-hands-behind-back-stretch/', name: 'ACE Fitness — Clasp Hands Behind Back' },
      { url: 'https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-stretch-major-muscles/', name: 'NHS — How to Stretch Major Muscles' },
    ],
  },

  'bw-squat': {
    detailedSteps: [
      'Đứng thẳng, hai chân rộng hơn hông một chút, mũi chân hơi xoay ra ngoài, hai tay khoanh trước ngực hoặc duỗi thẳng phía trước để giữ thăng bằng.',
      'Siết nhẹ cơ bụng, kéo vai xuống và ra sau, ngực hướng lên, mắt nhìn thẳng.',
      'Đẩy hông ra sau như đang ngồi xuống ghế, gập gối từ từ, dồn trọng lượng lên gót chân.',
      'Hạ người xuống đến khi đùi gần song song sàn (hoặc thấp hơn nếu thoải mái), giữ lưng thẳng, đầu gối thẳng hàng mũi chân.',
      'Thở ra nhẹ nhàng, đẩy gót chân xuống sàn để đứng dậy, duỗi thẳng hông và gối về vị trí ban đầu.',
      'Lặp lại nhịp chậm và có kiểm soát, tránh nín thở.',
    ],
    musclesWorked: ['Cơ đùi trước (quadriceps)', 'Cơ mông (gluteus)', 'Cơ đùi sau (hamstrings)', 'Cơ lõi (core)'],
    commonMistakes: [
      'Đầu gối khuỵu vào trong khi hạ xuống/đứng lên.',
      'Gót chân nhấc khỏi sàn, dồn lực lên mũi chân.',
      'Lưng dưới cong gập về phía trước thay vì giữ thẳng.',
      'Nín thở khi gắng sức (rặn) thay vì thở đều.',
    ],
    benefits: 'Tăng sức mạnh và sức bền toàn bộ phần thân dưới, cải thiện thăng bằng, vận động hông và sự ổn định của cơ lõi cho người mới tập.',
    safetyNotes: 'Sau mổ thoát vị bẹn: thở đều suốt động tác, tuyệt đối không nín thở rặn (Valsalva). Nếu đau gối, hạ nông hơn (chỉ tới ghế) và giữ đầu gối thẳng hàng mũi chân.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/', name: 'ACE Fitness — Bodyweight Squat' },
      { url: 'https://health.clevelandclinic.org/proper-squat-form', name: 'Cleveland Clinic — Proper Squat Form' },
    ],
  },

  'reverse-lunge': {
    detailedSteps: [
      'Đứng thẳng, hai chân rộng bằng hông, hai tay chống hông hoặc thả tự nhiên.',
      'Siết nhẹ cơ bụng, giữ ngực hướng lên trần và vai thả lỏng ra sau.',
      'Bước một chân ra phía sau một bước dài vừa phải, mũi chân sau chạm sàn trước.',
      'Hạ từ từ đầu gối chân sau xuống gần sàn (không chạm), gập gối chân trước thành góc ~90°.',
      'Giữ thân người thẳng đứng, không chúi về trước; trọng lượng dồn vào gót chân trước.',
      'Đẩy mạnh gót chân trước để bước chân sau trở về vị trí ban đầu.',
      'Đổi chân và lặp lại đều hai bên.',
    ],
    musclesWorked: ['Cơ mông', 'Cơ đùi trước', 'Cơ đùi sau', 'Cơ lõi'],
    commonMistakes: [
      'Bước quá ngắn khiến gối trước vượt mũi chân, áp lực lên khớp gối.',
      'Chúi người về trước thay vì giữ thân thẳng.',
      'Để đầu gối chân trước đổ vào trong.',
      'Mất thăng bằng do bước quá nhanh.',
    ],
    benefits: 'Tăng sức mạnh chân và mông từng bên cân bằng, nhẹ khớp gối hơn forward lunge, rèn luyện ổn định cơ lõi.',
    safetyNotes: 'Sau mổ thoát vị bẹn: bước nhẹ, thở đều, không bước quá rộng. Nếu đau gối: giảm độ sâu, không để gối sau chạm sàn, bám nhẹ vào ghế/tường.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/319/reverse-lunge/', name: 'ACE Fitness — Reverse Lunge' },
      { url: 'https://health.clevelandclinic.org/lunges-muscles-worked', name: 'Cleveland Clinic — Lunges: Form & Muscles' },
    ],
  },

  'standing-calf': {
    detailedSteps: [
      'Đứng thẳng, hai chân rộng bằng hông, mũi chân hướng thẳng phía trước. Có thể đứng cách tường ~15-30 cm, đặt hai lòng bàn tay lên tường ngang ngực để giữ thăng bằng.',
      'Siết nhẹ cơ bụng, vai thả lỏng, gối hơi mềm (không khóa cứng).',
      'Thở ra, từ từ nhón gót lên cao, dồn lực qua phần ụ ngón chân cái, giữ gối duỗi và bàn chân không xoay.',
      'Dừng 1-2 giây ở điểm cao nhất, cảm nhận cơ bắp chân siết lại.',
      'Hít vào, hạ gót chân xuống chậm và có kiểm soát đến khi gần chạm sàn.',
      'Lặp lại 10-15 lần. Có thể tập một chân khi đã quen để tăng thử thách.',
    ],
    musclesWorked: ['Cơ bụng chân lớn (gastrocnemius)', 'Cơ dép (soleus)', 'Cơ chày trước'],
    commonMistakes: [
      'Hạ gót quá nhanh, mất kiểm soát.',
      'Xoay bàn chân ra ngoài hoặc vào trong khi nhón.',
      'Dùng tay đẩy mạnh vào tường thay vì chỉ giữ thăng bằng.',
      'Khóa cứng đầu gối khi nhón lên.',
    ],
    benefits: 'Tăng sức mạnh và sức bền cho bắp chân, hỗ trợ đi đứng + leo cầu thang + cải thiện thăng bằng cho mắt cá chân.',
    safetyNotes: 'Sau mổ thoát vị bẹn: bài an toàn vì không tăng áp lực ổ bụng; nhớ thở đều. Nếu mất thăng bằng/đau gối, bám tường/ghế và giảm biên độ.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/73/standing-calf-raises-wall/', name: 'ACE Fitness — Standing Calf Raises (Wall)' },
      { url: 'https://www.nhs.uk/live-well/exercise/strength-exercises/', name: 'NHS Live Well — Strength Exercises' },
    ],
  },

  'incline-pushup': {
    detailedSteps: [
      'Chọn bề mặt vững chắc và cao như mặt bàn bếp, ghế dài hoặc bậc thềm. Bề mặt càng cao thì bài tập càng nhẹ.',
      'Đặt hai tay lên mép bàn/ghế, rộng hơn vai một chút, các ngón tay hướng về trước.',
      'Bước hai chân lùi ra sau cho đến khi cơ thể tạo đường thẳng từ đầu đến gót chân; siết nhẹ bụng và mông.',
      'Hít vào, gập khuỷu tay từ từ để hạ ngực về phía mép bàn/ghế. Khuỷu tạo góc ~45° so với thân, không bè ngang vuông góc.',
      'Khi ngực gần chạm bề mặt, thở ra và đẩy người trở lại vị trí ban đầu, không khóa cứng khuỷu.',
      'Giữ đầu, vai, hông, gót chân thẳng hàng. Khi quen có thể chọn bề mặt thấp hơn để tăng độ khó.',
    ],
    musclesWorked: ['Cơ ngực (pectorals)', 'Cơ vai trước', 'Cơ tam đầu (triceps)', 'Cơ lõi'],
    commonMistakes: [
      'Hông võng xuống hoặc đẩy mông cao, mất đường thẳng cơ thể.',
      'Khuỷu tay bè ngang quá mức gây căng vai.',
      'Hạ xuống quá nhanh, không kiểm soát.',
      'Nín thở khi đẩy lên (rặn) thay vì thở ra đều.',
    ],
    benefits: 'Giúp người mới xây sức mạnh phần thân trên (ngực, vai, tay sau) và cơ lõi an toàn, dễ chỉnh độ khó bằng cách đổi độ cao bề mặt.',
    safetyNotes: 'Sau mổ thoát vị bẹn: chọn bề mặt CAO (bàn bếp, tường) trong giai đoạn đầu để giảm áp lực bụng. Thở ra khi đẩy lên, tuyệt đối không rặn nín thở. Vai/khuỷu đau → nâng cao bề mặt thêm.',
    sources: [
      { url: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/', name: 'ACE Fitness — Push-Up' },
      { url: 'https://health.clevelandclinic.org/how-to-do-a-push-up', name: 'Cleveland Clinic — How To Do a Push-up' },
    ],
  },

  'walk-zone2': {
    detailedSteps: [
      'Khởi động 3-5 phút bằng cách đi chậm trên máy ở tốc độ 3-4 km/h, độ dốc 0%.',
      'Tăng dần tốc độ lên ~4.5-6 km/h (đi nhanh, không chạy), nâng độ dốc lên 3-8% tùy thể lực.',
      'Mục tiêu nhịp tim Zone 2: ~60-70% nhịp tim tối đa (HR max ≈ 220 - tuổi). VD người 40 tuổi: ~108-126 bpm.',
      'Kiểm tra cường độ bằng "talk test": vẫn nói được câu ngắn 3-5 từ rồi mới phải hít thở. Không nói nổi = quá sức.',
      'Duy trì 30-45 phút. Mỗi tuần tổng cộng tối thiểu 150 phút theo khuyến nghị AHA.',
      'Hạ nhiệt 3-5 phút bằng cách giảm dần độ dốc về 0% và giảm tốc trước khi dừng hẳn.',
      'Có thể bám tay nhẹ vào tay vịn nếu cần thăng bằng — nhưng KHÔNG tì hết trọng lượng (giảm hiệu quả).',
    ],
    musclesWorked: ['Cơ mông', 'Cơ đùi sau', 'Cơ bắp chân', 'Tim mạch & hô hấp'],
    commonMistakes: [
      'Dốc quá cao + tốc độ quá nhanh khiến nhịp tim vượt Zone 2.',
      'Tựa hết người vào tay vịn, làm giảm hiệu quả đốt mỡ.',
      'Bước quá ngắn hoặc nhón mũi chân thay vì đặt cả bàn chân, gây mỏi bắp chân.',
      'Bỏ khởi động/hạ nhiệt, dễ chóng mặt và đau cơ.',
    ],
    benefits: 'Đi bộ Zone 2 trên máy có dốc đốt mỡ hiệu quả vì cơ thể chủ yếu dùng mỡ làm nhiên liệu ở cường độ vừa phải. Cải thiện sức khỏe tim phổi, sức bền, ít rủi ro hơn HIIT. Mục tiêu: tốc độ ~5-6 km/h, dốc 3-8%, RPE 4-5/10.',
    safetyNotes: 'Sau mổ thoát vị bẹn: đi bộ Zone 2 là lựa chọn lý tưởng vì áp lực ổ bụng thấp. Bắt đầu dốc 1-3% trong 2-4 tuần đầu rồi tăng dần. Đau gối: dốc ≤5%, mang giày đệm tốt, rút ngắn bước.',
    sources: [
      { url: 'https://health.clevelandclinic.org/zone-2-cardio', name: 'Cleveland Clinic — What Is Zone 2 Cardio?' },
      { url: 'https://health.clevelandclinic.org/exercise-heart-rate-zones-explained', name: 'Cleveland Clinic — Heart Rate Zones' },
      { url: 'https://mcpress.mayoclinic.org/nutrition-fitness/zone-2-cardio-what-is-it-and-why-is-it-trending-online/', name: 'Mayo Clinic Press — Zone 2 Cardio' },
    ],
  },

  'walk-cooldown': {
    detailedSteps: [
      'Sau buổi tập chính, giảm tốc độ máy chạy về mức đi bộ chậm, ~3-4 km/h.',
      'Đặt độ dốc về 0%, tay vung tự nhiên, không bám tay vịn nếu giữ thăng bằng tốt.',
      'Đi bộ 3–5 phút, hít thở sâu bằng mũi và thở ra bằng miệng.',
      'Phút cuối, giảm tốc xuống 2-2.5 km/h cho đến khi nhịp tim gần mức nghỉ.',
      'Quan sát nhịp tim mục tiêu giảm dưới 100-110 bpm trước khi dừng hẳn.',
      'Bước xuống máy an toàn và chuyển sang động tác giãn cơ tĩnh.',
    ],
    musclesWorked: ['Toàn bộ cơ chân', 'Cơ cốt lõi', 'Hệ tim mạch và hô hấp'],
    commonMistakes: [
      'Dừng đột ngột thay vì giảm tốc dần — có thể gây chóng mặt.',
      'Bám chặt tay vịn khiến tư thế đi bộ không tự nhiên.',
      'Bỏ qua hạ nhiệt và đi giãn cơ ngay khi nhịp tim còn cao.',
    ],
    benefits: 'Giúp nhịp tim/huyết áp trở về mức nghỉ an toàn, giảm chóng mặt sau tập. Hỗ trợ thải lactate và bắt đầu hồi phục cơ.',
    safetyNotes: 'Người tăng huyết áp/bệnh tim/thoát vị tránh dừng đột ngột và tránh nín thở; báo ngay nếu đau ngực, khó thở, choáng.',
    sources: [
      { url: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/warm-up-cool-down', name: 'American Heart Association — Warm Up, Cool Down' },
      { url: 'https://www.acefitness.org/resources/everyone/blog/6656/why-you-should-cool-down-after-your-workout/', name: 'ACE Fitness — Why You Should Cool Down' },
    ],
  },
});
