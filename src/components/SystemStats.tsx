import type { SystemSnapshot } from '../types';

interface Props {
  snapshot: SystemSnapshot;
}

function pct(used: number, total: number): number {
  if (total === 0) return 0;
  return (used / total) * 100;
}

function fmt(bytes: number): string {
  const gb = bytes / 1_073_741_824;
  if (gb > 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1_048_576;
  if (mb > 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fmtNet(b: number): string {
  if (b > 1_073_741_824) return `${(b / 1_073_741_824).toFixed(2)} GB`;
  if (b > 1_048_576) return `${(b / 1_048_576).toFixed(2)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(2)} KB`;
  return `${b} B`;
}

function uptimeStr(secs: number): string {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function Gauge({ pct, color }: { pct: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <div className="gauge">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color}
          strokeWidth="8"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="gauge-text">{pct.toFixed(1)}%</div>
    </div>
  );
}

export function SystemStats({ snapshot }: Props) {
  const { cpus, memory, disks, networks, uptime, host_name, os_version, kernel_version } = snapshot;
  const cpuAvg = cpus.reduce((s, c) => s + c.usage, 0) / (cpus.length || 1);
  const memPct = pct(memory.used, memory.total);

  return (
    <div className="system-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>System</h3>
          <div className="stat-row">
            <span className="stat-label">Host</span>
            <span>{host_name}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">OS</span>
            <span>{os_version}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Kernel</span>
            <span>{kernel_version}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Uptime</span>
            <span>{uptimeStr(uptime)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">CPU Cores</span>
            <span>{cpus.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>CPU</h3>
          <div className="gauge-container">
            <Gauge pct={cpuAvg} color="var(--cpu-color)" />
          </div>
          {cpus.slice(0, 32).map((cpu, i) => (
            <div key={i} className="mini-bar-row">
              <span className="mini-label">CPU {i}</span>
              <div className="bar-container">
                <div className="bar cpu-bar" style={{ width: `${cpu.usage}%` }} />
                <span>{cpu.usage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="stat-card">
          <h3>Memory</h3>
          <div className="gauge-container">
            <Gauge pct={memPct} color="var(--memory-color)" />
          </div>
          <div className="stat-row">
            <span className="stat-label">Used</span>
            <span>{fmt(memory.used)} / {fmt(memory.total)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Available</span>
            <span>{fmt(memory.available)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Swap</span>
            <span>{fmt(memory.swap_used)} / {fmt(memory.swap_total)}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Disks</h3>
          {disks.map((d, i) => {
            const dp = pct(d.used, d.total);
            return (
              <div key={i} className="disk-row">
                <div className="stat-row">
                  <span className="stat-label">{d.mount_point}</span>
                  <span>{fmt(d.used)} / {fmt(d.total)}</span>
                </div>
                <div className="bar-container">
                  <div className="bar disk-bar" style={{ width: `${dp}%` }} />
                  <span>{dp.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="stat-card">
          <h3>Network</h3>
          {networks.map((n, i) => (
            <div key={i} className="stat-row">
              <span className="stat-label">{n.interface}</span>
              <span>▼{fmtNet(n.received)} ▲{fmtNet(n.transmitted)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
