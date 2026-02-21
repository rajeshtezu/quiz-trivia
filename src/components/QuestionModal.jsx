import { useEffect } from 'react';
import './QuestionModal.css';

export function QuestionModal({ question, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!question) return null;

  return (
    <div
      className="question-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="question-modal">
        <button
          type="button"
          className="question-modal-close"
          onClick={onClose}
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
    </div>
  );
}
