# Himbot Mission Control — Build Spec

## Overview
A Next.js app with Convex database that serves as a dashboard for Himbot (Ryan Alcorn's AI assistant). Deployed to Netlify.

## Tech Stack
- Next.js 14+ (App Router)
- Convex (real-time database)
- Tailwind CSS
- shadcn/ui components
- Dark theme (match Himbot's aesthetic — dark navy/slate, accent colors)

## Pages / Features (Priority Order)

### 1. Dashboard (/)
- Overview cards: active tasks count, recent memory entries, cron jobs status, sub-agents running
- Quick status: last heartbeat time, current model, session info
- Recent activity feed (last 10 actions)

### 2. Task Board (/tasks)
- Kanban-style board with columns: Backlog, In Progress, Review, Done
- Each task has: title, description, assignee (Ryan or Himbot), priority, created date, status
- Drag and drop between columns
- Quick-add task from any column
- Filter by assignee
- Real-time updates (Convex subscriptions)

### 3. Memory Browser (/memory)
- Left sidebar: file tree of all memory files (MEMORY.md, daily notes, entities, lessons, decisions)
- Main area: rendered markdown content of selected file
- Global search across all memory content
- Entity graph view: show people, companies, projects with link counts
- Click entity to see summary + items

### 4. Calendar / Cron (/calendar)
- Monthly calendar view
- Show all cron jobs with next run times
- Show completed runs with status (success/fail)
- Click a day to see all scheduled items
- Ability to add one-shot reminders

### 5. Agent Roster (/team)
- Cards for each sub-agent type: Researcher, Coder, Writer, Fact Extractor, Monitor, Designer, Analyst, Ops
- Each card shows: role description, last active, current task (if any), total runs
- Status indicator: idle / working / error
- Click to see recent work history

### 6. Office View (/office) — Fun one
- Isometric or top-down pixel art office
- Each agent has an avatar at a desk
- When working: agent is at computer, status bubble shows task
- When idle: agent is standing/walking around
- Click agent to see details
- Animated, playful, not a productivity blocker

## API Routes (for Himbot to push updates)
- POST /api/tasks — create/update task
- POST /api/activity — log activity
- POST /api/agents — update agent status
- POST /api/memory — sync memory file
- GET /api/status — current dashboard state

## Design
- Dark theme primary (slate-900/950 backgrounds)
- Accent: indigo-500 / purple-500 gradient (matches Match Capital aesthetic)
- Clean, minimal, professional but with personality
- Responsive but desktop-first (Ryan views on his Mac)
- Sidebar navigation with icons
- Himbot logo/avatar in top left

## Database Schema (Convex)

### tasks
- title: string
- description: string
- status: "backlog" | "in_progress" | "review" | "done"
- assignee: "ryan" | "himbot"
- priority: "low" | "medium" | "high" | "urgent"
- createdAt: number
- updatedAt: number

### activities
- type: string (task_created, memory_updated, cron_ran, agent_spawned, etc.)
- description: string
- timestamp: number
- metadata: object

### agents
- name: string
- role: string
- description: string
- status: "idle" | "working" | "error"
- currentTask: string?
- lastActive: number
- totalRuns: number

### memories
- path: string
- content: string
- lastModified: number
- type: "daily" | "entity" | "lesson" | "decision" | "core"

### cronJobs
- name: string
- schedule: string
- lastRun: number
- nextRun: number
- status: "active" | "disabled"
- lastResult: string

## Notes
- Don't over-engineer v1. Get the task board, memory browser, and dashboard working first.
- Office view can be simple CSS animations — no need for a game engine.
- Convex handles real-time subscriptions natively — use that for live updates.
- The API routes are how Himbot pushes updates from OpenClaw via n8n webhooks.
