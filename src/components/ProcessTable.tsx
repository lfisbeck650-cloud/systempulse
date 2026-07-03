import { useState, useMemo } from 'react';
import type { ProcessInfo, SortField } from '../types';

interface Props {
  processes: ProcessInfo[];
  onKill: (pid: number) => void;
}

function formatMem(kb: number): string {
  if (kb > 1_048_576) return `${(kb / 1_048_576).toFixed(1)} GB`;
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function formatUptime(secs: number): string {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ProcessTable({ processes, onKill }: Props) {
  const [sortField, setSortField] = useState<SortField>('cpu_usage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');
  const [confirmPid, setConfirmPid] = useState<number | null>(null);

  const sorted = useMemo(() => {
    const list = filter
      ? processes.filter((p) => {
          const q = filter.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            String(p.pid).includes(q) ||
            p.user.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q)
          );
        })
      : processes;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'cpu_usage':
          cmp = a.cpu_usage - b.cpu_usage;
          break;
        case 'memory_percent':
          cmp = a.memory_percent - b.memory_percent;
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'pid':
          cmp = a.pid - b.pid;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [processes, sortField, sortDir, filter]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function sortArrow(field: SortField) {
    if (sortField !== field) return '';
    return sortDir === 'desc' ? ' ▼' : ' ▲';
  }

  function handleKill(pid: number) {
    setConfirmPid(pid);
  }

  function confirmKill() {
    if (confirmPid !== null) {
      onKill(confirmPid);
      setConfirmPid(null);
    }
  }

  return (
    <div className="process-table">
      <div className="process-toolbar">
        <input
          type="text"
          placeholder="Filter by name, PID, user, status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
        <span className="process-count">{sorted.length} processes</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('pid')}>PID{sortArrow('pid')}</th>
              <th onClick={() => toggleSort('name')}>Name{sortArrow('name')}</th>
              <th onClick={() => toggleSort('cpu_usage')}>CPU%{sortArrow('cpu_usage')}</th>
              <th onClick={() => toggleSort('memory_percent')}>MEM%{sortArrow('memory_percent')}</th>
              <th>Memory</th>
              <th>Status</th>
              <th>User</th>
              <th>Uptime</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 500).map((p) => (
              <tr key={p.pid}>
                <td className="pid">{p.pid}</td>
                <td className="name" title={p.command}>{p.name}</td>
                <td className="cpu">
                  <div className="bar-container">
                    <div className="bar cpu-bar" style={{ width: `${Math.min(p.cpu_usage, 100)}%` }} />
                    <span>{p.cpu_usage.toFixed(1)}</span>
                  </div>
                </td>
                <td className="mem">
                  <div className="bar-container">
                    <div className="bar mem-bar" style={{ width: `${Math.min(p.memory_percent, 100)}%` }} />
                    <span>{p.memory_percent.toFixed(1)}</span>
                  </div>
                </td>
                <td>{formatMem(p.memory)}</td>
                <td>{p.status}</td>
                <td>{p.user}</td>
                <td>{formatUptime(p.uptime)}</td>
                <td>
                  <button className="kill-btn" onClick={() => handleKill(p.pid)} title={`Kill ${p.pid}`}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmPid !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmPid(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Kill process <strong>{confirmPid}</strong>?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmPid(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmKill}>Kill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
