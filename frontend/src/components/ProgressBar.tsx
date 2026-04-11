import { useEffect, useState } from 'react';
import { getProgress } from '../api/progress';
import { Progress } from '../types';

const LEVEL_COLOR: Record<string, string> = {
  beginner:     '#4f8ef7',
  intermediate: '#f5a623',
  advanced:     '#4caf82',
};

const LEVEL_NEXT: Record<string, { label: string; target: number }> = {
  beginner:     { label: 'Intermediate',  target: 10 },
  intermediate: { label: 'Advanced',      target: 30 },
  advanced:     { label: 'Master',        target: 30 },
};

function ProgressBar() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
  }, []);

  if (!progress) return null;

  const { level, analysesCount, streak, practiceCompleted, languagesUsed } = progress;
  const next = LEVEL_NEXT[level];
  const pct = Math.min((analysesCount / next.target) * 100, 100);
  const color = LEVEL_COLOR[level];

  return (
    <div className="progress-bar-panel">
      <div className="progress-stats">
        <div className="pstat">
          <span className="pstat-icon">📊</span>
          <span className="pstat-val">{analysesCount}</span>
          <span className="pstat-lbl">Analyses</span>
        </div>
        <div className="pstat">
          <span className="pstat-icon">🔥</span>
          <span className="pstat-val">{streak}</span>
          <span className="pstat-lbl">Day streak</span>
        </div>
        <div className="pstat">
          <span className="pstat-icon">✅</span>
          <span className="pstat-val">{practiceCompleted.length}</span>
          <span className="pstat-lbl">Practice done</span>
        </div>
        <div className="pstat">
          <span className="pstat-icon">💻</span>
          <span className="pstat-val">{languagesUsed.length}</span>
          <span className="pstat-lbl">Languages</span>
        </div>
      </div>

      <div className="level-row">
        <span className="level-badge" style={{ background: color }}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
        <div className="level-track">
          <div className="level-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="level-next">→ {next.label}</span>
      </div>
    </div>
  );
}

export default ProgressBar;
