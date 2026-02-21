import { useCallback, useEffect, useState } from 'react';
import { SpinWheel } from './components/SpinWheel';
import { QuestionModal } from './components/QuestionModal';
import { SettingsModal } from './components/SettingsModal';
import {
  getApiUrls,
  getQuestions,
  setApiUrls,
  putQuestions,
  markQuestionRead,
  normalizeQuestions,
} from './lib/db';
import { fetchQuestionsFromUrls } from './lib/api';
import './App.css';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickedQuestion, setPickedQuestion] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedUrls, setSavedUrls] = useState([]);

  const loadFromIndexedDB = useCallback(async () => {
    const stored = await getQuestions();
    if (stored?.length) {
      setQuestions(stored);
      return true;
    }
    return false;
  }, []);

  const fetchAndStore = useCallback(async (urls) => {
    const raw = await fetchQuestionsFromUrls(urls);
    const normalized = normalizeQuestions(raw);
    await putQuestions(normalized);
    setQuestions(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const hasStored = await loadFromIndexedDB();
        if (cancelled) return;
        if (hasStored) {
          setLoading(false);
          return;
        }
        const urls = await getApiUrls();
        if (urls.length) {
          await fetchAndStore(urls);
        }
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadFromIndexedDB, fetchAndStore]);

  const handlePick = useCallback(async (question) => {
    setPickedQuestion(question);
    await markQuestionRead(question.id);
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, isRead: true } : q))
    );
  }, []);

  const handleCloseQuestion = useCallback(() => {
    setPickedQuestion(null);
  }, []);

  const handleSaveSettings = useCallback(async (urls) => {
    await setApiUrls(urls);
    setSavedUrls(urls);
    if (urls.length) {
      setLoading(true);
      try {
        await fetchAndStore(urls);
      } finally {
        setLoading(false);
      }
    } else {
      setQuestions([]);
    }
  }, [fetchAndStore]);

  const openSettings = useCallback(async () => {
    const urls = await getApiUrls();
    setSavedUrls(urls);
    setSettingsOpen(true);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Quiz Trivia</h1>
        <button
          type="button"
          className="app-settings-btn"
          onClick={openSettings}
          aria-label="Open settings"
        >
          ⚙ Settings
        </button>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="app-loading">Loading…</div>
        ) : (
          <SpinWheel
            questions={questions}
            onPick={handlePick}
            disabled={loading}
          />
        )}
      </main>

      <QuestionModal
        question={pickedQuestion}
        onClose={handleCloseQuestion}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialUrls={savedUrls}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
