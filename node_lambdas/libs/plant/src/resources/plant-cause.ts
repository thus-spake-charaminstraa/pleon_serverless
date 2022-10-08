export const PlantCause = {
  water_lack: {
    cause: 'water_lack',
    cause_ko: '물 부족',
    cause_en: 'water lack',
    guide: '화분을 충분히 적시도록 물을 주세요!',
    symptom: ['leaf_browning', 'leaf_spot', 'leaf_curling', 'leaf_withering'],
  },
  water_excess: {
    cause: 'water_excess',
    cause_ko: '과습',
    cause_en: 'water excess',
    guide:
      '물을 주지 말고, 바람이 통하는 곳으로 화분을 옮겨 주세요.\n화분 겉흙을 헤집어서 뿌리에 공기가 통하게 해주세요.',
    symptom: ['leaf_browning', 'leaf_spot', 'leaf_withering'],
  },
  light_excess: {
    cause: 'light_excess',
    cause_ko: '햇빛 과다',
    cause_en: 'light excess',
    guide: '화분을 직사광선이 안닿는 반양지 혹은 반음지로 옮겨 주세요.',
    symptom: ['leaf_browning', 'leaf_curling', 'leaf_withering'],
  },
  humidity_lack: {
    cause: 'humidity_lack',
    cause_ko: '습도 부족',
    cause_en: 'humidity lack',
    guide: '식물에 분무 및 가습기를 틀어서 습도를 높혀 주세요.',
    symptom: ['leaf_browning', 'leaf_curling'],
  },
  temperature_excess: {
    cause: 'temperature_excess',
    cause_ko: '높은 기온',
    cause_en: 'temperature excess',
    guide: '공기 온도를 낮춰주세요.',
    symptom: ['leaf_browning', 'leaf_curling', 'leaf_withering'],
  },
  temperature_lack: {
    cause: 'temperature_lack',
    cause_ko: '낮은 기온',
    cause_en: 'temperature lack',
    guide: '공기 온도를 높혀주세요.',
    symptom: ['leaf_browning', 'leaf_withering'],
  },
  nutrition_lack: {
    cause: 'nutrition_lack',
    cause_ko: '영양 부족',
    cause_en: 'nutrition lack',
    guide: '식물이 좋아하는 비료를 주세요.',
    symptom: ['leaf_withering'],
  },
  nutrition_excess: {
    cause: 'nutrition_excess',
    cause_ko: '영양 과다',
    cause_en: 'nutrition excess',
    guide:
      '비료를 주지 말고, 물을 충분히 주어서 영양을 배출시키거나 분갈이를 통해 새로운 흙으로 이사해주세요.',
    symptom: ['leaf_browning'],
  },
  insect_desease: {
    cause: 'insect_desease',
    cause_ko: '병해충',
    cause_en: 'insect desease',
    guide: '약을 쳐서 병해충을 제거해 주세요.',
    symptom: ['leaf_hole', 'leaf_spot', 'leaf_withering'],
  },
};
