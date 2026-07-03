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
  pollInterval: number;
  onPollIntervalChange: (ms: number) => void;
}

export function Settings({ theme, onThemeChange, pollInterval, onPollIntervalChange }: Props) {
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
        <h2>Performance</h2>
        <div className="setting-row">
          <span className="setting-label">Refresh interval</span>
          <select
            className="setting-select"
            value={pollInterval}
            onChange={(e) => onPollIntervalChange(Number(e.target.value))}
          >
            <option value={500}>500 ms</option>
            <option value={1000}>1 s</option>
            <option value={2000}>2 s</option>
            <option value={5000}>5 s</option>
            <option value={10000}>10 s</option>
          </select>
        </div>
      </div>

      <div className="settings-card">
        <h2>About</h2>
        <div className="about-info">
          <p><strong>SystemPulse</strong> v1.0.0</p>
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
