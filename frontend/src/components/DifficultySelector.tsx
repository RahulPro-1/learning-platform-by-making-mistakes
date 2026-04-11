import { Difficulty } from '../types';

interface Props {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
}

const LEVELS: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'basic',        label: 'Basic',        desc: 'New to coding' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Know the basics' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Comfortable with the language' },
];

function DifficultySelector({ difficulty, onChange }: Props) {
  return (
    <div className="difficulty-row">
      <span className="difficulty-label">Level:</span>
      {LEVELS.map((l) => (
        <button
          key={l.value}
          className={`diff-btn diff-${l.value} ${difficulty === l.value ? 'active' : ''}`}
          onClick={() => onChange(l.value)}
          title={l.desc}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default DifficultySelector;
