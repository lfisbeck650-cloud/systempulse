import type { Theme } from '../types';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'nord', label: 'Nord' },
];

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

export function Settings({ theme, onThemeChange }: Props) {
  return (
    <div className="settings">
      <div className="settings-card">
        <h2>Appearance</h2>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`theme-btn theme-${t.value}${theme === t.value ? ' active' : ''}`}
              onClick={() => onThemeChange(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <h2>About</h2>
        <div className="about-info">
          <p><strong>SysTempulse</strong> v0.1.1</p>
          <p>Open source Linux task manager built with Tauri + Rust + React</p>
          <p>
            <a href="https://github.com/lfisbeck650-cloud/systempulse" target="_blank" rel="noreferrer">
              GitHub Repository
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
