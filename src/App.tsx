import { useState } from 'react';
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
  const { snapshot, error, killProcess } = useSystemInfo();

  return (
    <div className={`app theme-${theme}`}>
      <header className="app-header">
        <h1>SysTempulse</h1>
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

      {error && <div className="error-bar">Error: {error}</div>}

      <main className="app-main">
        {tab === 'processes' && snapshot && (
          <ProcessTable
            processes={snapshot.processes}
            onKill={killProcess}
          />
        )}
        {tab === 'system' && snapshot && <SystemStats snapshot={snapshot} />}
        {tab === 'settings' && (
          <Settings theme={theme} onThemeChange={setTheme} />
        )}
        {!snapshot && !error && (
          <div className="loading">Loading system data...</div>
        )}
      </main>
    </div>
  );
}

export default App;
