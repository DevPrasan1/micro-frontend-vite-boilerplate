# MFE Boilerplate MFE Development & Team Workflows

This document outlines how different teams (Video Browser, Player, Community, and Host/Core) develop, test, and run the MFE Boilerplate Micro-Frontend (MFE) platform locally.

---

## 🚀 1. Quick Local Installation

First, clone the repository and install dependencies at the root directory:

```bash
# Install root and workspace dependencies + link shared packages
npm install
```

---

## 🛠️ 2. Development Workflows by Team

### 📺 Workflow A: Video Browser Team

- **Focus**: Modifying video feeds, search, filters, pagination, category tabs, and cards.
- **MFE Location**: `apps/video-browser`
- **Local Run Commands**:
  - **Option A: Standalone Mode (Sub-millisecond HMR)**
    ```bash
    npm run dev -w @mfe/video-browser
    ```
    _Loads the MFE independently on [http://localhost:5001](http://localhost:5001). Useful for building isolated UI components without running the Host container or other MFEs._
  - **Option B: Embedded in Host container**
    ```bash
    # Runs Host dev server + automatic remote watch compiler
    npm run dev:mfe
    ```
    _Opens [http://localhost:5005](http://localhost:5005) inside the browser. Changes to files in the MFE will compile dynamically in the background._

---

### 🎥 Workflow B: Web Player Team

- **Focus**: Video renderers (YouTube iframe embeds) and container player layout.
- **MFE Location**: `apps/player`
- **Local Run Commands**:
  - **Option A: Standalone Mode**
    ```bash
    npm run dev -w @mfe/player
    ```
    _Loads the player independently on [http://localhost:5002](http://localhost:5002)._
  - **Option B: Embedded in Host container**
    ```bash
    npm run dev:mfe
    ```
    _Opens [http://localhost:5005](http://localhost:5005) inside the browser. Any changes to player source will recompile dynamically._

---

### 💬 Workflow C: Community Team

- **Focus**: Real-time Firestore chat threads, user profiles, message layouts, and profile page.
- **MFE Location**: `apps/community`
- **Local Run Commands**:
  - **Option A: Standalone Mode**
    ```bash
    npm run dev -w @mfe/community
    ```
    _Loads the community panel on [http://localhost:5003](http://localhost:5003)._
  - **Option B: Embedded in Host container**
    ```bash
    npm run dev:mfe
    ```
    _Opens [http://localhost:5005](http://localhost:5005) inside the browser. The comments load in real-time from your active Firestore instance._

---

### 🌐 Workflow D: Host / Core Platform Team

- **Focus**: Main application container shell, global routing, header & sidebar, shared Zustand stores, and Firebase Auth synchronization.
- **MFE Location**: `apps/host`
- **Local Run Commands**:
  ```bash
  # Compiles remotes + runs host dev server + watch recompilers
  npm run dev:mfe
  ```
  _Opens [http://localhost:5005](http://localhost:5005) inside the browser._

---

## ⚡ 3. The Shared Design System & Store Development

When modifying shared workspaces like `@mfe/shared-ui` or `@mfe/shared-store` (e.g., updating custom buttons or adding a state hook):

1. **How it links**: npm workspaces symlink these files automatically inside `/node_modules`.
2. **Rebuilding**:
   - If you are running in standalone dev mode (`npm run dev -w <app>`), **changes to packages propagate and hot-reload instantly**.
   - If you are running the embedded container (`npm run dev:mfe`), the watch compiler detects package changes and recompiles the remote assets dynamically.

---

## 🏗️ 4. Production Build & Verification

To verify production builds before shipping/deploying:

```bash
# 1. Compile production builds for all workspaces and packages
npm run build

# 2. Preview the built static assets locally (remotes serve remoteEntry.js)
npm run preview
```

---

## 📜 5. Root Scripts Directory (`package.json`)

Here is a directory of the root script commands and exactly what they do:

- **`npm run dev:mfe`** _(Recommended)_:
  - Runs an initial `build` for all packages.
  - Launches the Host shell on port `5005` in dev mode.
  - Boots the MFE preview servers on ports `5001-5003` to serve remote entries.
  - Starts background watchers (`--watch`) for the three remote MFEs. **Any saved changes inside remotes recompile and trigger an automatic browser reload!**
- **`npm start`**:
  - Runs an initial production build.
  - Previews the remotes statically, and starts the host on port `5005` in development mode.
- **`npm run build`**:
  - Compiles production-ready build files for all workspace apps and shared packages.
- **`npm run preview`**:
  - Previews the pre-built static MFE assets locally.
- **`npm run watch`**:
  - Spawns parallel background file-watchers for the `video-browser`, `player`, and `community` MFE projects.
- **`npm run dev`**:
  - Spawns Vite development servers for all workspaces in parallel on ports `5001-5003`.
- **`npm run dev:host` / `dev:browser` / `dev:player` / `dev:community`**:
  - Spawns dev server for the individual targeted micro-frontend application.
