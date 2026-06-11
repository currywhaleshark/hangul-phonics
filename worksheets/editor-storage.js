export function sourceSignature(sourceLesson) {
  return JSON.stringify(sourceLesson);
}

export function clearDraftForLesson(storage, draftKey, signatureKey) {
  storage.removeItem(draftKey);
  storage.removeItem(signatureKey);
}

export function writeDraftForSource(storage, draftKey, signatureKey, lesson, currentSourceSignature) {
  storage.setItem(draftKey, JSON.stringify(lesson));
  storage.setItem(signatureKey, currentSourceSignature);
}

export function loadDraftForSource(storage, draftKey, signatureKey, sourceLesson) {
  const saved = storage.getItem(draftKey);
  if (!saved) return { status: "miss", lesson: null };

  const savedSignature = storage.getItem(signatureKey);
  if (savedSignature !== sourceSignature(sourceLesson)) {
    clearDraftForLesson(storage, draftKey, signatureKey);
    return { status: "stale", lesson: null };
  }

  try {
    return { status: "hit", lesson: JSON.parse(saved) };
  } catch {
    clearDraftForLesson(storage, draftKey, signatureKey);
    return { status: "invalid", lesson: null };
  }
}
