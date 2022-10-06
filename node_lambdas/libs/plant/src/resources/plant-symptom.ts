export const PlantSymptom = {
  '0': { symptom: 'healthy', cause: [] },
  '1': { symptom: 'flower', cause: [] },
  '2': { symptom: 'flower_bud', cause: [] },
  '3': {
    symptom: 'leaf_browning',
    cause: [
      'water_lack',
      'water_excess',
      'light_excess',
      'humidity_lack',
      'temperature_excess',
    ],
  },
  '4': { symptom: 'leaf_hole', cause: ['insect_desease'] },
  '5': {
    symptom: 'leaf_spot',
    cause: ['water_lack', 'water_excess', 'insect_desease'],
  },
  '6': {
    symptom: 'leaf_curling',
    cause: [
      'water_lack',
      'humidity_lack',
      'light_excess',
      'temperature_excess',
    ],
  },
  '7': {
    symptom: 'leaf_withering',
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
  '8': { symptom: 'trash', cause: [] },
};
