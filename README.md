# SysTempulse

Modern open-source Linux task manager with a beautiful GUI.

Built with **Tauri v2**, **Rust**, **React**, and **TypeScript**.

## Features

- Real-time process monitoring with sortable columns
- Kill processes directly from the UI
- CPU, memory, disk, and network usage overview
- Multiple themes: Dark, Light, Dracula, Nord
- Lightweight native app

## Installation

### Debian / Ubuntu

```bash
sudo dpkg -i SysTempulse_0.1.0_amd64.deb
```

### AppImage

```bash
chmod +x SysTempulse_0.1.0_amd64.AppImage
./SysTempulse_0.1.0_amd64.AppImage
```

### Build from source

```bash
# Install dependencies
npm install
cd src-tauri && cargo build --release
```

## License

MIT
