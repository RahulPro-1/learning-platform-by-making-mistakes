import { Language } from '../types';

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'c',      label: 'C',      icon: '⚙️' },
  { value: 'cpp',    label: 'C++',    icon: '🔧' },
];

function LanguageSelector({ language, onChange }: Props) {
  return (
    <div className="lang-selector">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.value}
          className={`lang-btn ${language === lang.value ? 'active' : ''}`}
          onClick={() => onChange(lang.value)}
          title={`Switch to ${lang.label}`}
        >
          <span>{lang.icon}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;
