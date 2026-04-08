# Desktop App

This directory contains the formal desktop application workspace for Git Daily Reporter.

## Current Status

V0.2 initializes:

- React + Vite + TypeScript frontend shell
- Tauri v2 Rust shell
- default capability file
- frontend test and build pipeline

## Commands

```bash
npm install
npm test
npm run build
npm run tauri dev
```

## Linux System Dependencies

Tauri on Linux requires GTK/WebKit-related system libraries. On this machine,
`cargo check` currently fails because `pkg-config` cannot find:

- `gdk-pixbuf-2.0`
- `cairo`

Depending on distro, you will typically need packages such as:

- `libgtk-3-dev`
- `libwebkit2gtk-4.1-dev` or distro equivalent
- `libayatana-appindicator3-dev` or distro equivalent
- `librsvg2-dev`
- `pkg-config`
- `build-essential`

These package names vary by distribution.
