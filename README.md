# Windows All-in-One Toolbox

Een compacte Windows-desktopapp in Tauri 2, React, TypeScript en Rust. In het desktopvenster ververst het dashboard CPU, geheugen en opslag van de Windows-systeemschijf ongeveer elke twee seconden en toont het de gegevens van je pc. Met een ondersteunde NVIDIA-driver toont het ook de belasting en temperatuur van de eerste NVIDIA-kaart. De browserpreview gebruikt voorbeeldgegevens. De overige pagina’s zijn voorbereid op toekomstige functies.

## Starten op Windows

Installeer Node.js LTS met npm. Voor de desktopapp heb je ook Rust (stable MSVC), Microsoft C++ Build Tools met **Desktop development with C++** en Microsoft Edge WebView2 nodig. Zie de [Tauri-vereisten voor Windows](https://v2.tauri.app/start/prerequisites/#windows).

Open PowerShell in deze projectmap.

```powershell
npm install -g pnpm@11
pnpm install
pnpm tauri dev
```

Voor een browsertest volstaan Node.js en pnpm. Start `pnpm dev` en open [de lokale preview](http://127.0.0.1:1420). Gebruik `pnpm build` voor de TypeScript-controle en de frontendbuild.

## Projectstructuur

- `src/components` bevat de gedeelde navigatie en dashboardonderdelen.
- `src/pages` bevat het dashboard en de pagina-indeling voor de overige secties.
- `src/data` bevat de voorbeeldgegevens.
- `src-tauri` bevat de Rust-entrypoint en Tauri-configuratie.
