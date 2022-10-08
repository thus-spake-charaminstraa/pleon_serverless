export const PlantSymptom = {
  '0': {
    symptom: 'healthy',
    symptom_ko: '건강함',
    symptom_en: 'healthy',
    cause: [],
  },
  '1': { symptom: 'flower', symptom_ko: '꽃', symptom_en: 'flower', cause: [] },
  '2': {
    symptom: 'flower_bud',
    symptom_ko: '꽃봉오리',
    symptom_en: 'flower bud',
    cause: [],
  },
  '3': {
    symptom: 'leaf_browning',
    symptom_ko: '잎 끝 갈변',
    symptom_en: 'leaf browning',
    cause: [
      'water_lack',
      'water_excess',
      'light_excess',
      'humidity_lack',
      'temperature_excess',
    ],
  },
  '4': {
    symptom: 'leaf_hole',
    symptom_ko: '잎 구멍',
    symptom_en: 'leaf hole',
    cause: ['insect_desease'],
  },
  '5': {
    symptom: 'leaf_spot',
    symptom_ko: '잎 반점',
    symptom_en: 'leaf spot',
    cause: ['water_lack', 'water_excess', 'insect_desease'],
  },
  '6': {
    symptom: 'leaf_curling',
    symptom_ko: '잎 말림',
    symptom_en: 'leaf curling',
    cause: [
      'water_lack',
      'humidity_lack',
      'light_excess',
      'temperature_excess',
    ],
  },
  '7': {
    symptom: 'leaf_withering',
    symptom_ko: '시들은 잎',
    symptom_en: 'leaf withering',
    cause: [
      'water_lack',
      'water_excess',
      'light_excess',
      'temperature_excess',
      'temperature_lack',
      'nutrition_lack',
      'insect_desease',
    ],
  },
  '8': {
    symptom: 'trash',
    symptom_ko: '식별된 증상 없음',
    symptom_en: 'trash',
    cause: [],
  },
};