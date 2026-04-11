import { useEffect, useState } from 'react';
import { getSamples } from '../api/practice';
import { Language, SampleProgram } from '../types';

interface Props {
  language: Language;
  onSelect: (code: string) => void;
}

function SamplePicker({ language, onSelect }: Props) {
  const [samples, setSamples] = useState<SampleProgram[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getSamples(language)
      .then(setSamples)
      .catch(() => setSamples([]));
  }, [language]);

  if (samples.length === 0) return null;

  return (
    <div className="sample-picker">
      <button className="samples-btn" onClick={() => setOpen((o) => !o)}>
        📂 Load Sample
      </button>
      {open && (
        <div className="samples-dropdown">
          {samples.map((s) => (
            <button
              key={s.id}
              className={`sample-item diff-tag-${s.difficulty}`}
              onClick={() => { onSelect(s.code); setOpen(false); }}
              title={s.description}
            >
              <span className="sample-title">{s.title}</span>
              <span className={`diff-badge diff-${s.difficulty}`}>{s.difficulty}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SamplePicker;
