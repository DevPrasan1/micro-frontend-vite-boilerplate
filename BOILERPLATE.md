# Micro-Frontend Vite & Module Federation Boilerplate

Welcome! This repository has been structured specifically as a **Boilerplate Starter Kit** for building enterprise React applications using **Vite**, **Module Federation**, and **npm Workspaces**.

Below is the developer guide on why this architecture is chosen, how it is designed, and how any team can use it as a template to boot new MFEs or shared libraries.

---

## 🏗️ 1. Architecture Pillars

1. **npm Workspaces (Monorepo)**:
   - Reusable libraries live inside `/packages/`, and micro-applications live inside `/apps/`.
   - Root package coordinates all dependency setups, symlinking workspaces instantly when running `npm install`.
2. **Vite Module Federation (`@originjs/vite-plugin-federation`)**:
   - Bridges independent applications together at runtime.
   - Host shell (`apps/host`) imports exposed entry points from remote apps dynamically via HTTP.
3. **Shared Zustand Store Sync**:
   - Remotes and Host share a single state management registry.
   - Zustand hooks are attached as window singletons (e.g., `window.__mfe_player_store__`) to prevent memory leaks and state drift during runtime updates.
4. **Global Tailwind / PostCSS Theme**:
   - Shared component package (`@mfe/shared-ui`) includes Tailwind layouts. Storybook compiles and previews these components instantly using a native PostCSS directory watcher.

---

## ➕ 2. How to Add a New Remote MFE

To add a new micro-application (e.g., `apps/dashboard`) in 3 steps:

### Step 1: Create the App directory

Create `/apps/dashboard` containing a Vite React project. Ensure the `package.json` names the workspace:

```json
{
  "name": "@mfe/dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5004 --strictPort",
    "build": "vite build",
    "preview": "vite preview --port 5004 --strictPort"
  }
}
```

### Step 2: Configure Module Federation Exposes (`vite.config.ts`)

Set up the federation config inside the remote's Vite settings:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardApp': './src/App.tsx', // Expose the main entry point
      },
      shared: ['react', 'react-dom', 'zustand', 'react-router-dom', '@mfe/shared-store'],
    }),
  ],
});
```

### Step 3: Register Remote inside Host Shell (`apps/host/vite.config.ts`)

Inside the Host shell's Vite config, register the new remote entry URL:

```typescript
      remotes: {
        video_browser: 'http://localhost:5001/assets/remoteEntry.js',
        player: 'http://localhost:5002/assets/remoteEntry.js',
        community: 'http://localhost:5003/assets/remoteEntry.js',
        dashboard: 'http://localhost:5004/assets/remoteEntry.js', // Add dashboard port
      }
```

Now, you can lazy load it in the Host shell routes:

```typescript
const DashboardApp = React.lazy(() => import('dashboard/DashboardApp'));
```

---

## 📦 3. How to Add a New Shared Package

To add a new library package (e.g., `/packages/shared-helpers`):

1. Create the package folder structure:
   - `/packages/shared-helpers/package.json`
   - `/packages/shared-helpers/src/index.ts`
2. Add it to the root `tsconfig.json` path mappings:
   ```json
   "paths": {
     "@mfe/shared-helpers": ["./packages/shared-helpers/src/index.ts"]
   }
   ```
3. Run `npm install` at the root. npm will instantly symlink the workspace, allowing any app to import it.

---

## 🚀 4. Proposing on GitHub as a Template

To share and publish this boilerplate for other teams:

1. **Mark as Template**:
   - Navigate to your repository settings page on GitHub (`https://github.com/DevPrasan1/micro-frontend-vite-boilerplate/settings`).
   - Check the box **"Template repository"**. This adds the green **"Use this template"** button to your main repo landing page so developers can clone it as a clean starter instantly.
2. **Add badging to README**:
   - Place a link inside the main `README.md` introducing this boilerplate setup so developers know how to kick off their monorepo architecture.
