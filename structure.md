# MFE Boilerplate Micro-Frontend & Shared Library Guide

Welcome! If you are new to **Micro-Frontends (MFEs)**, **Module Federation**, and **Shared Libraries**, this guide will explain how MFE Boilerplate is structured and why.

---

## 1. The Monorepo Layout (npm Workspaces)

Instead of creating separate Git repositories for every single piece of our project, we use a **monorepo** (one repository).

Inside the project, we have two main directories:

- `/packages/`: Shared libraries containing reusable components, logic, and configurations.
- `/apps/`: Independent, runnable applications (Micro-Frontends).

We use **npm workspaces** to connect them. When you run `npm install` at the root, npm reads the `package.json` files inside all packages and apps, installs their third-party dependencies, and **symlinks** the packages together so apps can import them.

---

## 2. The Shared Libraries (`/packages`)

To avoid duplicating code, everything reusable is split into isolated packages. They do not contain any business screens; they only contain building blocks.

- **`shared-types`**: TypeScript interfaces (like `User`, `Channel`, `Comment`). This ensures all apps agree on what data looks like.
- **`shared-utils`**: Pure helper utilities (like formatting dates, views, throttling, or flags) and holds the parsed **`YT_CHANNELS`** database exported from `yt-videos.json`.
- **`shared-store`**: State management using **Zustand**. Includes small modular stores for Auth, Player, and UI. States are attached to window-level scope (e.g., `window.__mfe_player_store__`) to ensure a single shared instance propagates across MFE boundaries.
- **`shared-hooks`**: Custom React hooks (like `useAuth()`, `usePlayer()`) that apps call to interact with Zustand stores.
- **`shared-ui`**: Our Design System. Contains components like `Button`, `Card`, `Modal`, `Spinner`, `VideoCard`, and `CommentCard` built with Tailwind CSS.
- **`firebase`**: Code to initialize Firebase Auth and Firestore.

Because we configured paths inside `tsconfig.json`, your IDE understands imports like `import { Button } from '@mfe/shared-ui'` and provides auto-complete.

---

## 3. What is Module Federation?

**Module Federation** is a technology that allows a JavaScript application to dynamically load code from another application at runtime.

### Host vs. Remote

- **Host (`apps/host`)**: The "container" or "shell". It owns the main page layout, routing, header, sidebar, and authentication state. It decides when to load the other applications.
- **Remotes (`video-browser`, `player`, `community`)**: Independent micro-frontend apps. They build their own code and expose specific entry components for the Host to import.

### How they connect

1. Every remote app defines an **expose** configuration in its `vite.config.ts`. For example, `video-browser` exposes `./VideoBrowserApp`.
2. When built, the remote creates a special file called `remoteEntry.js` inside its build assets.
3. The host app registers these remotes in its `vite.config.ts` by pointing to their URLs:
   - Video Browser: `http://localhost:5001/assets/remoteEntry.js`
   - Player: `http://localhost:5002/assets/remoteEntry.js`
   - Community: `http://localhost:5003/assets/remoteEntry.js`
4. In the host source code (`apps/host/src/App.tsx`), we load them dynamically using React's lazy loading:
   ```typescript
   const VideoBrowserApp = React.lazy(() => import('video_browser/VideoBrowserApp'));
   ```

### Shared Singletons

To prevent downloading React or Zustand multiple times, Module Federation is configured to share these libraries. Only a single copy of React is loaded in the browser, and all apps use that same instance.

---

## 4. How the Apps interact at Runtime

A key rule of Micro-Frontends is that **apps should never import code directly from other apps** (e.g. Player should never import from Video Browser).

Instead, they communicate using the **Shared Store**:

```
  ┌────────────────────────────────────────────────────────┐
  │                   Host App (Shell)                     │
  │                                                        │
  │     ┌────────────────── Shared Store ────────────────┐  │
  │     │  user (Auth)   selectedChannel   theme (UI)    │  │
  │     └────────────────────────────────────────────────┘  │
  │           ▲                  ▲                  ▲       │
  └───────────┼──────────────────┼──────────────────┼───────┘
              │                  │                  │
        (Reads Auth)      (Sets Channel)      (Reads Channel)
              │                  │                  │
      ┌───────┴──────┐     ┌─────┴────────┐   ┌─────┴──────┐
      │  Community   │     │Video Browser │   │   Player   │
      │     MFE      │     │     MFE      │   │    MFE     │
      └──────────────┘     └──────────────┘   └────────────┘
```

1. **Video Browser MFE** displays a list of video cards loaded from the YouTube comedy dataset. When you click one, it updates the `selectedChannel` in the shared store.
2. The Host observes this change and navigates the user to `/watch/:channelId`.
3. **Player MFE** detects that `selectedChannel` has been updated in the shared store. It parses the video URL and dynamically embeds the YouTube iframe player with autoplay configurations.
4. **Community MFE** detects the new video ID and loads the corresponding message chats from Firestore.

If the **Player MFE** crashes, the Host's `ErrorBoundary` catches the crash and displays a fallback, while the rest of the application (Header, Sidebar, Community chat) continues to function normally!
