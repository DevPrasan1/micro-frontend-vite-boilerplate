# StreamHub - Video Management Platform (Micro-Frontend)

> **A production-inspired Video Management Platform built with React, Vite, Module Federation, Firebase, Storybook, and Zustand.**
>
> The goal of this project is **not to clone YouTube**, but to demonstrate how a large enterprise application can be split into independently developed and deployed Micro-Frontends.

---

# 1. Project Goals

This project demonstrates:

* ✅ Micro-Frontend Architecture
* ✅ Module Federation
* ✅ Independent Deployment
* ✅ Shared Authentication
* ✅ Shared Global State
* ✅ Shared Design System
* ✅ Enterprise Folder Structure
* ✅ HLS Video Streaming
* ✅ Firebase Integration
* ✅ Storybook
* ✅ TypeScript
* ✅ Clean Architecture

---

# 2. Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Module Federation
* React Router
* Tailwind CSS
* HLS.js
* Zustand
* React Hook Form
* Zod

---

## Backend

Firebase

* Authentication
* Firestore

---

## UI

Storybook

---

## Data

IPTV-org

Channel metadata

HLS URLs

Countries

Languages

Categories

---

## Deployment

Vercel

Every MFE deployed independently.

---

# 3. High Level Architecture

```
                         StreamHub

                    Host (Container)

        Authentication
        Routing
        Layout
        Shared Store
        Shared Components

       ┌────────────┬─────────────┬──────────────┐
       │            │             │              │
       ▼            ▼             ▼

 Video Browser     Player      Community
```

---

# 4. Why Micro-Frontend?

Imagine a company with 3 frontend teams.

```
Team A
↓

Video Browser

-------------------

Team B
↓

Player

-------------------

Team C
↓

Community
```

Every team

* develops independently
* deploys independently
* owns its domain

Exactly what Module Federation was designed for.

---

# 5. Applications

```
apps/

host/

video-browser/

player/

community/
```

---

# 6. Packages

```
packages/

shared-ui/

shared-store/

shared-hooks/

shared-utils/

shared-types/

firebase/
```

No application imports code directly from another application.

Everything reusable lives in packages.

---

# 7. Responsibilities

---

## Host

Owns

* Authentication
* Layout
* Routing
* Sidebar
* Header
* Theme
* Error Boundary
* Shared Zustand Store
* Firebase Initialization
* Dynamic Remote Loading

Host never owns business logic.

---

## Video Browser

Responsibilities

* Search
* Filter
* Categories
* Countries
* Languages
* Recently Watched
* Favorites
* Video Grid

Consumes IPTV-org metadata.

Updates

```
selectedChannel
```

Nothing else.

---

## Player

Responsibilities

* HLS Playback
* Fullscreen
* PiP
* Volume
* Playback Speed
* Keyboard Shortcuts
* Quality Selection
* Player Statistics

Consumes

```
selectedChannel
```

---

## Community

Responsibilities

* Comments
* Replies
* Like
* Dislike
* Edit
* Delete
* Sort

Firestore

Realtime

---

# 8. Host Layout

```
----------------------------------------------------

Header

----------------------------------------------------

Sidebar

Main Content

----------------------------------------------------
```

Routes

```
/

/login

/watch/:channelId

/profile
```

---

# 9. Shared State

Host owns global state.

```
Auth

Theme

Selected Channel

Search

Sidebar

Language
```

Everything else stays inside each MFE.

---

## Auth Store

```
user

login()

logout()

loading
```

---

## Player Store

```
selectedChannel

volume

isPlaying

playbackRate
```

---

## UI Store

```
theme

sidebar

search

language
```

Small stores.

Not one giant store.

---

# 10. Authentication

Firebase Authentication

Methods

* Google
* Email Password
* GitHub (optional)

Flow

```
Login

↓

Firebase

↓

Host

↓

Auth Store

↓

All MFEs
```

Only Host knows authentication.

---

# 11. Firestore Structure

```
users/

favorites/

history/

comments/

likes/
```

---

## Comments

```
comments

    commentId

        channelId

        uid

        userName

        message

        createdAt
```

---

## Likes

```
likes

channelId_uid
```

---

## Favorites

```
favorites

uid

channelIds[]
```

---

## History

```
history

uid

channelId

currentTime

updatedAt
```

---

# 12. IPTV-org

Use

```
channels.json

streams.json

countries.json

languages.json

categories.json
```

Merge

```
Channel

+

Stream URL

↓

Video Card
```

---

# 13. Storybook

Shared components only.

```
Button

Card

Badge

Avatar

Search

Dropdown

Tabs

Tooltip

Modal

Spinner

VideoCard

CommentCard
```

Every component documented.

Variants

Loading

Disabled

Error

Dark

Light

---

# 14. Shared Types

```
User

Channel

Comment

Favorite

Category

Country

PlaybackStats
```

No duplicate interfaces.

---

# 15. Shared Hooks

```
useAuth()

usePlayer()

useTheme()

useDebounce()

useFirestore()

useSearch()
```

---

# 16. Shared Utilities

```
formatDate()

formatViews()

formatDuration()

countryFlag()

debounce()

throttle()
```

---

# 17. Module Federation

```
Host

↓

Video Browser

↓

Player

↓

Community
```

Shared

```
React

React DOM

Zustand

Tailwind

Shared UI

Shared Types
```

---

# 18. Dynamic Loading

Player isn't downloaded until user opens a video.

Community isn't downloaded until watch page opens.

Improves initial load.

---

# 19. Error Boundary

If Player crashes

```
Player

❌

↓

Host

Shows fallback

↓

Browser

Still works

↓

Community

Still works
```

This is a major benefit of Micro-Frontends.

---

# 20. Search Flow

```
Search

↓

Video Browser

↓

Host updates Search Store

↓

Video Browser updates list
```

Player doesn't care.

Community doesn't care.

---

# 21. Video Flow

```
Click Video

↓

Host

selectedChannel

↓

Player

↓

Load HLS

↓

Community

↓

Load Comments
```

No direct communication between MFEs.

---

# 22. Features

## Video Browser

* Search
* Country Filter
* Category Filter
* Language Filter
* Favorites
* Recently Watched
* Infinite Scroll (optional)

---

## Player

* HLS.js
* Fullscreen
* Picture in Picture
* Playback Speed
* Quality Selection
* Volume
* Keyboard Shortcuts
* Player Statistics

---

## Community

* Comments
* Replies
* Like
* Dislike
* Edit
* Delete
* Sort
* Realtime

---

# 23. Nice Enhancements

## Continue Watching

Store

```
currentTime
```

Firestore

Resume playback automatically.

---

## Favorites

Logged-in users

Save favorite channels.

---

## Dark Mode

Shared across all MFEs.

---

## Multi-language

English

Hindi

---

## Keyboard Shortcuts

Space

Play Pause

M

Mute

F

Fullscreen

Arrow Keys

Seek (where applicable)

---

# 24. Future Extensions

Version 2

* Multi-view (2x2 or 3x3 live streams)
* AI-generated video summaries (for VOD)
* Stream health monitoring
* Admin dashboard for channel management
* Notifications
* User roles (Viewer, Moderator, Admin)
* Analytics MFE
* Stream recording support

---
