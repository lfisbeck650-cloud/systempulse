# SysTempulse

Modern, high-performance Linux task manager with a beautiful native GUI.

Built with **Tauri v2**, **Rust**, **React 19**, and **TypeScript**.

![SysTempulse](public/icons.png)

---

## Features

- **Real-time Process Monitoring** — Sortable, filterable process table with CPU/MEM bars
- **Kill Processes** — One-click process termination from the UI
- **System Overview** — CPU gauges (global + per-core), memory usage, disk usage per mount point, network traffic per interface
- **System Info** — Hostname, OS version, kernel version, uptime
- **Multiple Themes** — Dark, Light, Dracula, Nord
- **Lightweight** — Native performance via Tauri + Rust backend, minimal RAM footprint
- **Fast Polling** — Refreshes every 2 seconds with optimized Rust backend

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Tauri Shell                        │
│  ┌─────────────────┐     ┌────────────────────────┐│
│  │   React 19 UI    │◄───►│   Rust Backend         ││
│  │  (TypeScript)    │ IPC │   (sysinfo crate)      ││
│  │                  │     │                        ││
│  │  - ProcessTable  │     │  - CPU/Memory/Disk/Net ││
│  │  - SystemStats   │     │  - Process management  ││
│  │  - Settings      │     │  - RwLock concurrency  ││
│  └─────────────────┘     └────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Backend (Rust)

- **Zero-cost abstractions** — Uses `sysinfo` crate for direct system calls
- **Concurrent access** — `RwLock` instead of `Mutex` for read-optimized state
- **Minimal allocations** — Pre-allocated vectors, cached static system info (hostname, OS, kernel)
- **Efficient refresh** — Selective `RefreshKind` to only fetch changed data
- **Standalone** — Single binary, no Electron overhead

### Frontend (React/TypeScript)

- **React 19** with hooks for state management
- **2-second polling** with cleanup on unmount
- **Virtual filtering** — Client-side sort/search on up to 500 processes
- **CSS custom properties** — 4 complete theme color schemes
- **No external CSS framework** — Minimal, hand-crafted styles

---

## Installation

### Debian / Ubuntu

```bash
sudo dpkg -i SystemPulse_1.0.0_amd64.deb
```

### openSUSE / Fedora (RPM)

```bash
sudo rpm -i SystemPulse-1.0.0-1.x86_64.rpm
```

### AppImage

```bash
chmod +x SystemPulse_1.0.0_amd64.AppImage
./SystemPulse_1.0.0_amd64.AppImage
```

---

## Build from Source

### Prerequisites

- **Rust** (1.77.2+) — [rustup.rs](https://rustup.rs)
- **Node.js** (20+) — [nodejs.org](https://nodejs.org)
- **System deps** (Linux): `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `librsvg2-dev`, `libappindicator3-dev`

```bash
# Install system dependencies (Debian/Ubuntu)
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev librsvg2-dev libappindicator3-dev

# Clone
git clone https://github.com/lfisbeck650-cloud/systempulse.git
cd systempulse

# Install frontend dependencies
npm install

# Build and run in dev mode
npm run tauri dev

# Build release binary
npm run tauri build
```

Release artifacts will be in `src-tauri/target/release/bundle/`.

---

## Performance Optimizations

To ensure maximum speed, the following optimizations were implemented:

| Optimization | Impact |
|---|---|
| `RwLock` over `Mutex` | Concurrent reads, no contention on IPC calls |
| Cached static info (hostname, OS, kernel) | Eliminates redundant syscalls per poll |
| Selective `RefreshKind` | Only refreshes CPU/Memory/Processes — not disks/net unless needed |
| Pre-allocated `Vec::with_capacity` | No reallocation during process collection |
| Bare `sysinfo` crate | Minimal overhead, direct `/proc` access on Linux |
| Tauri v2 native IPC | Zero-serialization overhead for string data |

---

## Development

```bash
# Start dev server with hot-reload
npm run tauri dev

# Lint frontend
npm run lint

# Build frontend only
npm run build

# Build Rust backend only
cd src-tauri && cargo build --release
```

---

## Project Structure

```
systempulse/
├── public/                    # Static assets (favicon, icons)
├── src/                       # React/TypeScript frontend
│   ├── App.tsx                # Root component with tabs
│   ├── App.css                # Full theming system (4 themes)
│   ├── types.ts               # TypeScript interfaces
│   ├── hooks/
│   │   └── useSystemInfo.ts   # Polling hook (2s interval)
│   └── components/
│       ├── ProcessTable.tsx   # Sortable/filterable process list
│       ├── SystemStats.tsx    # CPU/RAM/Disk/Network gauges
│       └── Settings.tsx       # Theme picker + About
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs            # Entry point
│   │   ├── lib.rs             # Tauri app setup
│   │   ├── commands.rs        # IPC handlers
│   │   └── system.rs          # System data collection
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Tauri configuration
├── package.json               # Node dependencies
└── vite.config.ts             # Vite build config
```

---

## Themes

SysTempulse ships with four carefully designed themes:

| Theme | Description |
|---|---|
| **Dark** (default) | GitHub-dark inspired, easy on the eyes |
| **Light** | Clean white background, high contrast |
| **Dracula** | Dark purple, vibrant accents |
| **Nord** | Arctic blue-gray, calm and muted |

---

## License

MIT

---

## Author

[Lenny](https://github.com/lfisbeck650-cloud)
