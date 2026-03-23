# Nexus App Template

A React + TypeScript + Vite template for building browser-based apps that integrate with [Audiotool](https://new.audiotool.com/). This app participates in live multiplayer DAW sessions and can read/write projects in real time.

## What's included

This template gives you a working foundation:

- **Auth flow**: OAuth login via `useAuth` and `LoginScreen`. Users log in with their Audiotool account and authorize your app. The flow handles redirects, login state, and logout.

- **Project selection**: Connect to an existing project or create a new one. `ProjectSelector` lets users paste a project URL, pick from their project list, or create an empty project. Project URL is synced with the browser URL for shareable links.

- **SyncedDocument examples**: `ProjectSyncedComponent` shows how to work with the synced document: query entities (`t.entities.ofTypes()`), create entities (`t.create()`), read field values, and use `nexus.modify()` for transactional edits. Use it as a starting point for your own logic.

## Audiotool Setup

Before running the app, you need to configure OAuth with the Audiotool Developer Dashboard.

### 1. Create an Audiotool account

If you don’t have one yet, sign up at [Audiotool Beta](https://beta.audiotool.com/).

### 2. Register your app and get a Client ID

1. Go to the [Audiotool Developer Dashboard](https://developer.audiotool.com/)
2. Open [Applications](https://developer.audiotool.com/applications) (or “My Apps”)
3. Create a new application
4. Fill in:
   - **Name** / **Description** / **Website**: Any values you like
   - **Redirect URIs**: `http://127.0.0.1:5173/` (matches the Vite dev server)
   - **Scopes**: `project:write`
5. Save the app and copy its **Client ID**

### 3. Configure the app

Copy `.env.example` to `.env` and set your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_CLIENT_ID=your-actual-client-id-from-dashboard
VITE_REDIRECT_URL=http://127.0.0.1:5173/
```

### 4. Run the app

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/. Click **Log in with Audiotool** — you’ll be redirected to Audiotool to authorize the app, then back to your app where you can connect to a project.

For more details, see the [Getting Started guide](https://developer.audiotool.com/js-package-documentation/documents/Getting_Started.html) and [JS documentation](https://developer.audiotool.com/js-package-documentation/).
