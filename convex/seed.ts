import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed tasks
    const taskCount = await ctx.db.query("tasks").collect();
    if (taskCount.length === 0) {
      const now = Date.now();
      const tasks = [
        { title: "Build Mission Control dashboard", description: "Create the main overview page with stats", status: "done" as const, assignee: "himbot" as const, priority: "high" as const },
        { title: "Implement Kanban drag & drop", description: "Add DnD functionality to task board", status: "done" as const, assignee: "himbot" as const, priority: "high" as const },
        { title: "Memory browser with file tree", description: "Show all memory files with search", status: "in_progress" as const, assignee: "himbot" as const, priority: "medium" as const },
        { title: "Review GrantExec pipeline", description: "Check current deal flow and follow-ups needed", status: "backlog" as const, assignee: "ryan" as const, priority: "high" as const },
        { title: "Set up Convex deployment", description: "Configure production Convex backend", status: "in_progress" as const, assignee: "himbot" as const, priority: "urgent" as const },
        { title: "Deploy to Netlify", description: "Production deploy with env vars", status: "backlog" as const, assignee: "himbot" as const, priority: "medium" as const },
        { title: "Write weekly strategy memo", description: "Summarize current priorities for Q1 2026", status: "review" as const, assignee: "ryan" as const, priority: "medium" as const },
        { title: "Update MEMORY.md patterns", description: "Add new navigation rules from last week", status: "backlog" as const, assignee: "himbot" as const, priority: "low" as const },
        { title: "Research competitor pricing", description: "Compare GrantExec vs alternatives", status: "backlog" as const, assignee: "himbot" as const, priority: "medium" as const },
        { title: "Fix heartbeat extraction bug", description: "lastExtractedTs not updating correctly", status: "done" as const, assignee: "himbot" as const, priority: "urgent" as const },
      ];
      for (const task of tasks) {
        await ctx.db.insert("tasks", { ...task, createdAt: now - Math.random() * 86400000 * 7, updatedAt: now - Math.random() * 86400000 });
      }
    }

    // Seed activities
    const actCount = await ctx.db.query("activities").collect();
    if (actCount.length === 0) {
      const now = Date.now();
      const activities = [
        { type: "task_created", description: "Task created: Build Mission Control dashboard" },
        { type: "memory_updated", description: "Updated MEMORY.md with Netlify Pro plan details" },
        { type: "cron_ran", description: "Heartbeat extraction completed — 3 new facts extracted" },
        { type: "agent_spawned", description: "Researcher agent spawned for GrantExec pricing analysis" },
        { type: "task_completed", description: "Task done: Fix heartbeat extraction bug" },
        { type: "memory_updated", description: "Created entity: companies/match-capital" },
        { type: "cron_ran", description: "Gmail check completed — 2 important emails flagged" },
        { type: "task_updated", description: "Task moved to Review: Write weekly strategy memo" },
        { type: "agent_spawned", description: "Coder agent spawned for Mission Control build" },
        { type: "cron_ran", description: "ClickUp sync — 12 tasks updated" },
      ];
      for (let i = 0; i < activities.length; i++) {
        await ctx.db.insert("activities", {
          ...activities[i],
          timestamp: now - i * 600000,
          metadata: {},
        });
      }
    }

    return "seeded";
  },
});
