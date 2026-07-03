import { useState, useCallback } from 'react';
import { useSystemInfo } from './hooks/useSystemInfo';
import { ProcessTable } from './components/ProcessTable';
import { SystemStats } from './components/SystemStats';
import { Settings } from './components/Settings';
import type { Tab, Theme } from './types';
import './App.css';

const TABS: { id: Tab; label: string }[] = [
  { id: 'processes', label: 'Processes' },
  { id: 'system', label: 'System' },
  { id: 'settings', label: 'Settings' },
];

function App() {
  const [tab, setTab] = useState<Tab>('processes');
  const [theme, setTheme] = useState<Theme>('dark');
  const [pollInterval, setPollInterval] = useState(2000);
  const { snapshot, error, toasts, killProcess, dismissToast } = useSystemInfo(pollInterval);

  const handleThemeChange = useCallback((t: Theme) => setTheme(t), []);

  return (
    <div className={`app theme-${theme}`}>
      <header className="app-header">
        <div className="header-brand">
          <svg className="header-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h1>SystemPulse</h1>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="header-status">
          {snapshot && (
            <span>
              CPU: {(
                snapshot.cpus.reduce((s, c) => s + c.usage, 0) /
                (snapshot.cpus.length || 1)
              ).toFixed(1)}%
              {' | '}
              MEM: {(
                (snapshot.memory.used / snapshot.memory.total) * 100
              ).toFixed(1)}%
            </span>
          )}
        </div>
      </header>

      {error && <div className="error-bar">{error}</div>}

      <main className="app-main">
        <div className={`tab-content ${tab === 'processes' ? 'active' : ''}`}>
          {tab === 'processes' && snapshot && (
            <ProcessTable processes={snapshot.processes} onKill={killProcess} />
          )}
        </div>
        <div className={`tab-content ${tab === 'system' ? 'active' : ''}`}>
          {tab === 'system' && snapshot && <SystemStats snapshot={snapshot} />}
        </div>
        <div className={`tab-content ${tab === 'settings' ? 'active' : ''}`}>
          {tab === 'settings' && (
            <Settings
              theme={theme}
              onThemeChange={handleThemeChange}
              pollInterval={pollInterval}
              onPollIntervalChange={setPollInterval}
            />
          )}
        </div>
        {!snapshot && !error && (
          <div className="loading">
            <div className="spinner" />
            <span>Loading system data...</span>
          </div>
        )}
      </main>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismissToast(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
