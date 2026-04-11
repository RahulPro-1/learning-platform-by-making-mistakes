import { useEffect, useState } from 'react';
import { getPracticeQuestions } from '../api/practice';
import { Language, Difficulty, PracticeQuestion } from '../types';

interface Props {
  language: Language;
  difficulty: Difficulty;
  completedIds: string[];
  onLoad: (code: string) => void;
  onMarkDone: (id: string) => void;
}

function PracticePanel({ language, difficulty, completedIds, onLoad, onMarkDone }: Props) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getPracticeQuestions({ difficulty, language })
      .then(({ questions }) => setQuestions(questions))
      .catch(() => setQuestions([]));
  }, [difficulty, language]);

  if (questions.length === 0)
    return <p className="practice-empty">No practice questions for this filter yet.</p>;

  return (
    <div className="practice-list">
      {questions.map((q) => {
        const done = completedIds.includes(q.id);
        const isOpen = expanded === q.id;

        return (
          <div key={q.id} className={`practice-item ${done ? 'practice-done' : ''}`}>
            <button className="practice-header" onClick={() => setExpanded(isOpen ? null : q.id)}>
              <div className="practice-header-left">
                <span className="practice-done-icon">{done ? '✅' : '⬜'}</span>
                <span className="practice-title">{q.title}</span>
                <span className={`diff-badge diff-${q.difficulty}`}>{q.difficulty}</span>
                <span className="err-badge badge-error" style={{ fontSize: '10px' }}>{q.errorType}</span>
              </div>
              <span className="err-toggle">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="practice-body">
                <p className="practice-desc">{q.description}</p>

                <div className="practice-hints">
                  <p className="practice-hints-title">💡 Hints (if you get stuck):</p>
                  <ol className="practice-hints-list">
                    {q.hints.map((h, i) => <li key={i}>{h}</li>)}
                  </ol>
                </div>

                <div className="practice-actions">
                  <button
                    className="practice-load-btn"
                    onClick={() => onLoad(q.brokenCode)}
                  >
                    📋 Load Broken Code
                  </button>
                  {!done && (
                    <button
                      className="practice-mark-btn"
                      onClick={() => onMarkDone(q.id)}
                    >
                      ✅ Mark as Done
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PracticePanel;
