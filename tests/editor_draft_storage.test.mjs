import assert from "node:assert/strict";

import {
  clearDraftForLesson,
  loadDraftForSource,
  sourceSignature,
  writeDraftForSource,
} from "../worksheets/editor-storage.js";

function fakeStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

const draftKey = "draft:lesson-03";
const signatureKey = "draft:lesson-03:sourceSignature";
const originalSource = {
  title: "3레슨",
  pages: [{ read: "나는 미미 문어야. 내 몸에는 ㅁ 네모 길이 있어." }],
};
const updatedSource = {
  title: "3레슨",
  pages: [{ read: "나는 미미 문어야. ㅁ 네모 길이 있는 어항에 살고 있어." }],
};
const editedDraft = {
  title: "3레슨 편집본",
  pages: [{ read: "사용자가 임시로 고친 문장" }],
};

{
  const storage = fakeStorage();
  writeDraftForSource(storage, draftKey, signatureKey, editedDraft, sourceSignature(originalSource));

  const result = loadDraftForSource(storage, draftKey, signatureKey, originalSource);

  assert.equal(result.status, "hit");
  assert.deepEqual(result.lesson, editedDraft);
}

{
  const storage = fakeStorage();
  writeDraftForSource(storage, draftKey, signatureKey, editedDraft, sourceSignature(originalSource));

  const result = loadDraftForSource(storage, draftKey, signatureKey, updatedSource);

  assert.equal(result.status, "stale");
  assert.equal(result.lesson, null);
  assert.equal(storage.getItem(draftKey), null, "stale draft should be removed");
  assert.equal(storage.getItem(signatureKey), null, "stale source signature should be removed");
}

{
  const storage = fakeStorage();
  storage.setItem(draftKey, JSON.stringify(editedDraft));

  const result = loadDraftForSource(storage, draftKey, signatureKey, updatedSource);

  assert.equal(result.status, "stale");
  assert.equal(result.lesson, null);
  assert.equal(storage.getItem(draftKey), null, "legacy drafts without source signatures should be removed");
}

{
  const storage = fakeStorage();
  writeDraftForSource(storage, draftKey, signatureKey, editedDraft, sourceSignature(originalSource));

  clearDraftForLesson(storage, draftKey, signatureKey);

  assert.equal(storage.getItem(draftKey), null);
  assert.equal(storage.getItem(signatureKey), null);
}
