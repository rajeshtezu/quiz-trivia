import { openDB } from 'idb';

const DB_NAME = 'quiz-trivia-db';
const DB_VERSION = 1;
const STORE_QUESTIONS = 'questions';
const STORE_SETTINGS = 'settings';
const SETTINGS_KEY = 'apiUrls';

/**
 * Normalize API response to our question shape: { id, title, description, isRead }.
 * Accepts array of objects with various possible field names.
 * Uses runId so merged results from multiple APIs get unique ids.
 */
export function normalizeQuestions(rows, runId = Date.now()) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, index) => {
    const rawId = row.id ?? row._id;
    const id = rawId != null ? `${runId}-${String(rawId)}` : `q-${runId}-${index}`;
    const title = row.title ?? row.question ?? row.text ?? String(id);
    const description =
      row.description ?? row.answer ?? row.detail ?? row.explanation ?? '';
    const isRead = Boolean(row.isRead ?? row.is_read ?? false);
    return { id: String(id), title, description, isRead };
  });
}

/**
 * Open IndexedDB and ensure stores exist.
 */
async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
        db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
    },
  });
}

/**
 * Get stored API URLs from settings. Returns array of strings (empty if none).
 */
export async function getApiUrls() {
  const db = await getDB();
  const raw = await db.get(STORE_SETTINGS, SETTINGS_KEY);
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter((u) => typeof u === 'string' && u.trim().length > 0);
}

/**
 * Save API URLs and clear questions so next load refetches.
 */
export async function setApiUrls(urls) {
  const list = Array.isArray(urls) ? urls : [];
  const normalized = list
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter(Boolean);
  const db = await getDB();
  await db.put(STORE_SETTINGS, normalized, SETTINGS_KEY);
  await clearQuestions();
}

/**
 * Replace all questions in IndexedDB (e.g. after fetch or merge).
 */
export async function putQuestions(questions) {
  const db = await getDB();
  const tx = db.transaction(STORE_QUESTIONS, 'readwrite');
  await tx.store.clear();
  for (const q of questions) {
    await tx.store.put(q);
  }
  await tx.done;
}

/**
 * Mark a question as read by id.
 */
export async function markQuestionRead(id) {
  const db = await getDB();
  const q = await db.get(STORE_QUESTIONS, id);
  if (q) {
    await db.put(STORE_QUESTIONS, { ...q, isRead: true });
  }
}

/**
 * Get all questions from IndexedDB.
 */
export async function getQuestions() {
  const db = await getDB();
  return db.getAll(STORE_QUESTIONS);
}

/**
 * Clear all questions (used when API URLs change).
 */
export async function clearQuestions() {
  const db = await getDB();
  await db.clear(STORE_QUESTIONS);
}
