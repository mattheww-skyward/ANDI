# Build Instructions

This project uses `web-ext` to build browser-specific extension packages for Chrome, Firefox, and Edge.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

```bash
npm install
```

## Building

### Build for all browsers
```bash
npm run build
```

### Build for specific browsers
```bash
npm run build:chrome    # Build for Chrome
npm run build:firefox   # Build for Firefox  
npm run build:edge      # Build for Edge
```

This creates browser-specific builds in the `dist/` directory with appropriate manifest.json files:

- **Chrome/Edge**: Uses `background.service_worker`
- **Firefox**: Uses `background.scripts` and includes `browser_specific_settings`

## Packaging

### Package all browsers
```bash
npm run package
```

### Package specific browsers
```bash
npm run package:chrome    # Package Chrome extension
npm run package:firefox   # Package Firefox extension
npm run package:edge      # Package Edge extension
```

This creates installable ZIP files in the `packages/` directory:
- `andi-chrome.zip`
- `andi-firefox.zip` 
- `andi-edge.zip`

## Complete Build & Package
```bash
npm run clean && npm run build && npm run package
```

## Clean Build Artifacts
```bash
npm run clean
```

This removes the `dist/` and `packages/` directories.

## Browser Differences

### Chrome
- Uses Manifest v3 with `service_worker` background script
- Full Chrome extension API support

### Firefox
- Uses Manifest v3 with `scripts` background (service workers not yet fully supported)
- Includes `browser_specific_settings` with gecko ID and minimum version
- Requires Firefox 109+ for Manifest v3 support

### Edge
- Uses same configuration as Chrome (Chromium-based)
- Full Edge extension API support