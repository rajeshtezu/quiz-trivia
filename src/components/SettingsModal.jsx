import { useState, useEffect } from 'react';
import './SettingsModal.css';

const DEFAULT_PLACEHOLDER = 'https://api.example.com/questions';

export function SettingsModal({ isOpen, onClose, initialUrls, onSave }) {
  const [urls, setUrls] = useState(['']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrls(
        initialUrls?.length
          ? [...initialUrls, '']
          : ['']
      );
      setError('');
    }
  }, [isOpen, initialUrls]);

  const addRow = () => setUrls((prev) => [...prev, '']);
  const removeRow = (index) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };
  const changeUrl = (index, value) => {
    setUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const list = urls.map((u) => u.trim()).filter(Boolean);
    if (!list.length) {
      setError('Add at least one API URL.');
      return;
    }
    setSaving(true);
    try {
      await onSave(list);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2 id="settings-modal-title">Settings</h2>
          <button
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        <p className="settings-modal-hint">
          Enter API URLs that return JSON with an array of questions. Each
          question should have a title and optional description.
        </p>
        <form onSubmit={handleSubmit} className="settings-form">
          <label className="settings-label">API URLs</label>
          {urls.map((url, index) => (
            <div key={index} className="settings-url-row">
              <input
                type="url"
                value={url}
                onChange={(e) => changeUrl(index, e.target.value)}
                placeholder={DEFAULT_PLACEHOLDER}
                className="settings-input"
                autoComplete="off"
              />
              <button
                type="button"
                className="settings-remove"
                onClick={() => removeRow(index)}
                aria-label="Remove URL"
                disabled={urls.length <= 1}
              >
                −
              </button>
            </div>
          ))}
          <button type="button" className="settings-add" onClick={addRow}>
            + Add URL
          </button>
          {error && <p className="settings-error" role="alert">{error}</p>}
          <div className="settings-actions">
            <button type="button" className="settings-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="settings-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
