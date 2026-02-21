import { useEffect, useState } from 'react';
import './QuestionModal.css';

export function QuestionModal({ question, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCloseRequest = () => setShowConfirm(true);
  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };
  const handleCancelClose = () => setShowConfirm(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return;
      setShowConfirm((prev) => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!question) return null;

  return (
    <div
      className="question-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
    >
      <div className="question-modal">
        <button
          type="button"
          className="question-modal-close"
          onClick={handleCloseRequest}
          aria-label="Close and reset wheel"
        >
          ×
        </button>
        <h2 id="question-modal-title" className="question-modal-title">
          {question.title}
        </h2>
        {question.description && (
          <div className="question-modal-description">
            {question.description}
          </div>
        )}
      </div>

      {showConfirm && (
        <div
          className="question-modal-confirm-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="question-modal-confirm">
            <h3 id="confirm-title" className="question-modal-confirm-title">
              Close question?
            </h3>
            <p className="question-modal-confirm-message">
              Are you sure you want to close? The wheel will be ready for the next spin.
            </p>
            <div className="question-modal-confirm-actions">
              <button
                type="button"
                className="question-modal-confirm-cancel"
                onClick={handleCancelClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="question-modal-confirm-close"
                onClick={handleConfirmClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
