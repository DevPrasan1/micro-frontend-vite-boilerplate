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
| `VITE_GA_ID`          | `G-XXXXXX` (your Google Analytics ID)            |

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

---

## GitHub Actions CI/CD (Automated Deployment)

The CI/CD pipeline in `.github/workflows/ci.yml` **automatically deploys all 4 sites on every push** to `main`/`boilerplate`.

### Is it free?

| Platform           | Free Tier                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| **GitHub Actions** | ✅ Unlimited minutes on **public repos**. 2,000 min/month on private repos |
| **Netlify**        | ✅ 300 build minutes/month, unlimited sites, 100GB bandwidth               |

> This entire setup runs completely within both free tiers.

### Pipeline Flow

```
push to branch
      │
      ▼
  [quality]          ← lint + format + tests
      │
   ┌──┴──────────────────────┐
   ▼          ▼              ▼
[catalog]  [details]     [reviews]   ← deployed in parallel
   └──┬──────────────────────┘
      ▼
   [host]                            ← deployed after all remotes are live
```

### Required GitHub Secrets and Variables

Because some configurations are sensitive (secrets) and others are plain-text configs (variables), you need to configure them in different tabs under your environment or repository settings:

1. **Secrets** (go to **Settings → Secrets and variables → Actions → Secrets**):

| Secret Name          | How to get it                                             |
| -------------------- | --------------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Applications → New access token |

2. **Variables** (go to **Settings → Secrets and variables → Actions → Variables**):

| Variable Name             | Value / How to get it                                      |
| ------------------------- | ---------------------------------------------------------- |
| `NETLIFY_SITE_ID_CATALOG` | Netlify catalog site → Site Configuration → Site ID        |
| `NETLIFY_SITE_ID_DETAILS` | Netlify details site → Site Configuration → Site ID        |
| `NETLIFY_SITE_ID_REVIEWS` | Netlify reviews site → Site Configuration → Site ID        |
| `NETLIFY_SITE_ID_HOST`    | Netlify host site → Site Configuration → Site ID           |
| `VITE_REMOTE_CATALOG`     | `https://<catalog-site>.netlify.app/assets/remoteEntry.js` |
| `VITE_REMOTE_DETAILS`     | `https://<details-site>.netlify.app/assets/remoteEntry.js` |
| `VITE_REMOTE_REVIEWS`     | `https://<reviews-site>.netlify.app/assets/remoteEntry.js` |

### One-time Bootstrap Setup

Before the pipeline can run, create the 4 empty Netlify sites **manually once**:

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**
2. Create 4 sites (can upload any placeholder zip — just to get the Site IDs)
3. Copy the Site IDs into your GitHub secrets
4. Push to trigger the automated pipeline — it will overwrite with the real builds
