export const PlantCause = {
  water_lack: {
    cause: 'water_lack',
    symptom: ['leaf_browning', 'leaf_spot', 'leaf_curling', 'leaf_withering'],
  },
  water_excess: {
    cause: 'water_excess',
    symptom: ['leaf_browning', 'leaf_spot', 'leaf_withering'],
  },
  light_excess: {
    cause: 'light_excess',
    symptom: ['leaf_browning', 'leaf_curling', 'leaf_withering'],
  },
  humidity_lack: {
    cause: 'humidity_lack',
    symptom: ['leaf_browning', 'leaf_curling'],
  },
  temperature_excess: {
    cause: 'temperature_excess',
    symptom: ['leaf_browning', 'leaf_curling', 'leaf_withering'],
  },
  temperature_lack: {
    cause: 'temperature_lack',
    symptom: ['leaf_browning', 'leaf_withering'],
  },
  nutrition_lack: {
    cause: 'nutrition_lack',
    symptom: ['leaf_withering'],
  },
  nutrition_excess: {
    cause: 'nutrition_excess',
    symptom: ['leaf_browning'],
  },
  insect_desease: {
    cause: 'insect_desease',
    symptom: ['leaf_hole', 'leaf_spot', 'leaf_withering'],
  }
};
