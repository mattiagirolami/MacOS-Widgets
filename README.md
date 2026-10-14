# Übersicht Widgets

A collection of desktop widgets for [Übersicht](http://tracesof.net/uebersicht/), the macOS desktop widget engine.

## Widgets

### ⏰ clock.widget
Digital clock with date. Refreshes every **1 second**.

### 🖥️ system-info.widget
Glassmorphism-style system panel showing:
- **CPU** — user / sys usage percentages
- **RAM** — used memory + *really available* percentage (from `memory_pressure`)
- **Temperature** — thermal state via `pmset -g therm`; turns **red** when the system is throttling, green when normal
- **Disk** — free space / total on `/`

Refreshes every **30 seconds**. Positioned bottom-right, below the clock.

## Install

1. Install [Übersicht](http://tracesof.net/uebersicht/) (`brew install --cask ubersicht`)
2. Clone this repo (or download it)
3. Symlink the widgets into the Übersicht widgets folder:

```bash
mkdir -p ~/Library/Application\ Support/Übersicht/widgets
ln -s "$(pwd)/clock.widget" ~/Library/Application\ Support/Übersicht/widgets/
ln -s "$(pwd)/system-info.widget" ~/Library/Application\ Support/Übersicht/widgets/
```

4. Launch Übersicht. Widgets reload automatically on file changes.

## Notes

- All commands used (`top`, `memory_pressure`, `pmset`, `df`, `date`) ship with every macOS — no external dependencies, no admin rights required.
- Widget positioning must live at the **top level** of `className` (e.g. `bottom: 20px; right: 20px;`), not inside a `root {}` block. In current Übersicht versions `root {}` compiles to a descendant selector that matches nothing — see the `GettingStarted.jsx` example shipped with the app.
