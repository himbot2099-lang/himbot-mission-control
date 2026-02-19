# 🤖 Himbot Mission Control

Real-time dashboard for Ryan's AI assistant — Himbot.

**Stack:** Next.js 14 (App Router) · Convex · Tailwind CSS · shadcn/ui · Dark theme

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats, activity feed, system info |
| `/tasks` | Kanban board — drag & drop, real-time sync |
| `/memory` | Memory browser — file tree + markdown viewer |
| `/calendar` | Cron schedule viewer + calendar |
| `/team` | Agent roster — status, runs, current tasks |
| `/office` | Animated office view — agents at desks |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Initialize Convex
```bash
npx convex dev
```
This opens a browser to log in, creates a Convex project, and generates types. Copy the deployment URL.

### 3. Set environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_CONVEX_URL
```

### 4. Run development server
```bash
npm run dev
```

### 5. Seed initial data
Open the browser, go to dashboard — the app will auto-seed agents and cron jobs on first load.

---

## API Endpoints (for Himbot to push data)

### `POST /api/tasks`
```json
{
  "title": "Build something cool",
  "description": "Optional details",
  "status": "backlog|in_progress|review|done",
  "assignee": "ryan|himbot",
  "priority": "low|medium|high|urgent"
}
```

### `POST /api/activity`
```json
{
  "type": "task_created|memory_updated|cron_ran|agent_spawned",
  "description": "Human-readable description",
  "metadata": {}
}
```

### `POST /api/agents`
```json
{
  "name": "Researcher",
  "role": "Research & Intel",
  "status": "idle|working|error",
  "currentTask": "Optional task description",
  "totalRuns": 42
}
```

### `POST /api/memory`
```json
{
  "path": "memory/2026-02-18.md",
  "content": "# Daily Notes\n...",
  "type": "daily|entity|lesson|decision|core"
}
```

### `GET /api/status`
Returns current dashboard state (task counts, agent status, last activity).

---

## Netlify Deployment

1. Push to GitHub
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set `NEXT_PUBLIC_CONVEX_URL` in Netlify env vars
5. Deploy

The `@netlify/plugin-nextjs` plugin is pre-configured in `netlify.toml`.

---

## Convex Functions

After editing `convex/*.ts`, regenerate types:
```bash
npx convex dev
```

Deploy to production:
```bash
npx convex deploy
```
