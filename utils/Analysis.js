import { STRESS_LABELS, STRESS_INFO } from "../constants/stressTypes";
export function analyzeImage(uri) {
  let hash = 0;
  for (let i = 0; i < uri.length; i += 1) {
    hash = (hash + uri.charCodeAt(i) * (i + 1)) % 1000;
  }

  const label = STRESS_LABELS[hash % STRESS_LABELS.length];
  const confidence = Math.min(0.99, 0.7 + (hash % 30) / 100);

  return {
    label,
    confidence,
    info: STRESS_INFO[label] ?? "No additional information available.",
  };
}

export function buildHistoryItem(uri, prediction) {
  return {
    id: Date.now().toString(),
    imageUri: uri,
    label: prediction.label,
    confidence: prediction.confidence,
    info: prediction.info,
    createdAt: new Date().toISOString(),
  };
}