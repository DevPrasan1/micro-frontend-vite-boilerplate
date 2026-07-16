# Netlify Deployment Guide

> This MFE monorepo deploys as **4 independent Netlify sites** — one per micro-frontend.
> Each remote MFE must be deployed before the host, since the host references them by URL at build time.

---

## Architecture Overview

```
Netlify Site 1: mfe-catalog.netlify.app    ← product-catalog remote
Netlify Site 2: mfe-details.netlify.app    ← product-details remote
Netlify Site 3: mfe-reviews.netlify.app    ← product-reviews remote
Netlify Site 4: mfe-host.netlify.app       ← host container (loads the 3 above)
```

---

## Step 1 — Deploy the 3 Remote MFEs

For each remote, create a **new Netlify site** connected to this repo.

### product-catalog

| Setting               | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| **Build command**     | `npm install && npm run build -w @mfe/product-catalog` |
| **Publish directory** | `apps/product-catalog/dist`                            |
| **Base directory**    | _(root of repo)_                                       |

### product-details

| Setting               | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| **Build command**     | `npm install && npm run build -w @mfe/product-details` |
| **Publish directory** | `apps/product-details/dist`                            |
| **Base directory**    | _(root of repo)_                                       |

### product-reviews

| Setting               | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| **Build command**     | `npm install && npm run build -w @mfe/product-reviews` |
| **Publish directory** | `apps/product-reviews/dist`                            |
| **Base directory**    | _(root of repo)_                                       |

---

## Step 2 — Deploy the Host

After the 3 remotes are deployed, you'll have URLs like:

- `https://mfe-catalog.netlify.app`
- `https://mfe-details.netlify.app`
- `https://mfe-reviews.netlify.app`

Create a **4th Netlify site** for the host with these settings:

| Setting               | Value                                       |
| --------------------- | ------------------------------------------- |
| **Build command**     | `npm install && npm run build -w @mfe/host` |
| **Publish directory** | `apps/host/dist`                            |
| **Base directory**    | _(root of repo)_                            |

### ⚠️ Required Environment Variables (Host Site Only)

In your **Host Netlify site → Site Settings → Environment Variables**, add:

| Key                   | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| `VITE_REMOTE_CATALOG` | `https://mfe-catalog.netlify.app/assets/remoteEntry.js` |
| `VITE_REMOTE_DETAILS` | `https://mfe-details.netlify.app/assets/remoteEntry.js` |
| `VITE_REMOTE_REVIEWS` | `https://mfe-reviews.netlify.app/assets/remoteEntry.js` |

> Replace the URLs with your actual Netlify site URLs after deployment.

---

## Step 3 — Trigger a Rebuild of the Host

After setting the environment variables, trigger a **manual deploy** on the Host site so it rebuilds with the correct production remote URLs.

---

## Local Development (No Change Needed)

When running locally, `VITE_REMOTE_*` variables are not set, so the host automatically falls back to:

- `http://localhost:5001` → product-catalog
- `http://localhost:5002` → product-details
- `http://localhost:5003` → product-reviews

---

## netlify.toml Files

Each app has its own `netlify.toml` already configured:

- `apps/host/netlify.toml`
- `apps/product-catalog/netlify.toml`
- `apps/product-details/netlify.toml`
- `apps/product-reviews/netlify.toml`

> The remote apps include `Access-Control-Allow-Origin: *` headers — **required** for Module Federation cross-origin script loading.
