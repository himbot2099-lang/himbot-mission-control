You are building Himbot Mission Control — a dashboard app for an AI assistant named Himbot.

Read SPEC.md for the full build specification.

Key requirements:
- Next.js 14+ with App Router
- Convex for real-time database
- Tailwind CSS + shadcn/ui
- Dark theme (slate-900/950 backgrounds, indigo/purple accents)
- Desktop-first, responsive

Build order:
1. Set up Next.js + Convex + Tailwind + shadcn/ui
2. Dashboard page with overview cards
3. Task Board (Kanban) with Convex real-time
4. Memory Browser with search
5. Calendar/Cron view
6. Agent Roster
7. Office View (fun animated version)

When completely finished with a working v1, run:
openclaw system event --text "Done: Himbot Mission Control v1 built — dashboard, task board, memory browser, calendar, agent roster, office view. Ready for review." --mode now
