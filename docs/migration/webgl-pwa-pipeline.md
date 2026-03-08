# Unity WebGL + PWA Pipeline

## 1. Unity WebGL Export Steps
1. Install Unity WebGL Build Support module.
2. Open project and switch platform: **File → Build Settings → WebGL → Switch Platform**.
3. Recommended Player Settings:
   - Compression Format: Brotli (or Gzip if CDN constraints)
   - Data Caching: Enabled
   - Strip Engine Code: Enabled
   - Managed Stripping Level: Medium/High (validate runtime)
4. Build output to: `webgl-pwa-template/game/Build/`

Expected Unity outputs:
- `game.loader.js`
- `game.framework.js`
- `game.data`
- `game.wasm`

## 2. PWA Wrapper
The `webgl-pwa-template/game/` directory provides:
- `index.html`
- `manifest.json`
- `service-worker.js`
- `icons/` (192 and 512 placeholders)
- `Build/` Unity artifacts destination

## 3. Offline Strategy
Service worker uses cache-first strategy for:
- `index.html`
- `manifest.json`
- `Build/*` Unity runtime files
- icon files

After first online load/installation, subsequent launches should work offline if all pre-cache URLs resolve.

## 4. Deployment Structure
Deploy under HTTPS with:

```
/game
  index.html
  manifest.json
  service-worker.js
  icons/
  Build/
    game.loader.js
    game.framework.js
    game.data
    game.wasm
```

## 5. Validation Checklist
- Load once online, then toggle browser offline mode and refresh.
- Confirm PWA install prompt availability.
- Confirm Unity player boots and save/load still works in WebGL.
- Confirm service worker activation and cache contents in DevTools.
