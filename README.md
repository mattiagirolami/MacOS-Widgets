# Übersicht Widgets

A collection of desktop widgets for [Übersicht](http://tracesof.net/uebersicht/), the macOS desktop widget engine.

## Widgets

### ⏰ clock.widget

Digital clock with date. Refreshes every **1 second**.

### 🖥️ system-info.widget

Glassmorphism-style system panel with **two concentric rings** (SVG) — CPU outer, RAM inner — plus the thermal state in the center. Ring color shifts green → yellow → red as usage grows:

- **CPU** — user / sys usage percentages (ring = user + sys)
- **RAM** — *really available* percentage from `memory_pressure` (ring = 100 − free); used memory shown in the legend
- **Temperature** — thermometer icon in the center, colored by range (green < 40°C, yellow < 55°C, orange < 70°C, red ≥ 70°C) with the °C value below, read from the `AppleSmartBattery` sensor via `ioreg` (no sudo); turns **red + "HOT"** when `pmset` reports throttling. Note: without admin rights macOS only exposes the battery/pack sensor, not the real SoC temp — it tracks system heat well enough for a widget.

Refreshes every **30 seconds**. Positioned bottom-right, below the energy widget.

### ⚡ energy.widget

Top **3 processes** by power impact on Apple Silicon (colonna `POWER` di `top`), con barra proporzionale colorata: rosso = alto consumo, giallo = medio, verde = basso. Se nessun processo sta consumando, mostra "Sistema in riposo 🌙".

Refreshes every **30 seconds**. Positioned bottom-right, above the clock.

## Install

1. Install [Übersicht](http://tracesof.net/uebersicht/) (`brew install --cask ubersicht`)
2. Clone this repo (or download it)
3. Symlink the widgets into the Übersicht widgets folder:

```bash
mkdir -p ~/Library/Application\ Support/Übersicht/widgets
ln -s "$(pwd)/clock.widget" ~/Library/Application\ Support/Übersicht/widgets/
ln -s "$(pwd)/system-info.widget" ~/Library/Application\ Support/Übersicht/widgets/
ln -s "$(pwd)/energy.widget" ~/Library/Application\ Support/Übersicht/widgets/
```

1. Launch Übersicht. Widgets reload automatically on file changes.

## Notes

- All commands used (`top`, `memory_pressure`, `pmset`, `df`, `date`) ship with every macOS — no external dependencies, no admin rights required.
- The `POWER` column of `top` is only available on Apple Silicon; on Intel Macs the widget falls back to showing "Sistema in riposo".
- Widget positioning must live at the **top level** of `className` (e.g. `bottom: 20px; right: 20px;`), not inside a `root {}` block. In current Übersicht versions `root {}` compiles to a descendant selector that matches nothing — see the `GettingStarted.jsx` example shipped with the app.
