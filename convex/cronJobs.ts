import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cronJobs").collect();
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    schedule: v.string(),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("disabled")),
    lastResult: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cronJobs")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("cronJobs", args);
  },
});

export const toggleStatus = mutation({
  args: { id: v.id("cronJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(args.id, {
      status: job.status === "active" ? "disabled" : "active",
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("cronJobs").collect();
    if (existing.length > 0) return;

    const now = Date.now();
    const hour = 3600000;

    const jobs = [
      {
        name: "Memory Heartbeat",
        schedule: "*/30 * * * *",
        description: "Extract facts from recent conversations",
        status: "active" as const,
        lastRun: now - 15 * 60000,
        nextRun: now + 15 * 60000,
        lastResult: "success",
      },
      {
        name: "Daily Summary",
        schedule: "0 20 * * *",
        description: "Compile and send daily briefing",
        status: "active" as const,
        lastRun: now - 4 * hour,
        nextRun: now + 20 * hour,
        lastResult: "success",
      },
      {
        name: "Gmail Check",
        schedule: "*/15 * * * *",
        description: "Check for important emails and flag them",
        status: "active" as const,
        lastRun: now - 8 * 60000,
        nextRun: now + 7 * 60000,
        lastResult: "success",
      },
      {
        name: "ClickUp Sync",
        schedule: "0 * * * *",
        description: "Sync ClickUp tasks to memory",
        status: "active" as const,
        lastRun: now - 45 * 60000,
        nextRun: now + 15 * 60000,
        lastResult: "success",
      },
      {
        name: "Weekly Memory Synthesis",
        schedule: "0 9 * * 1",
        description: "Rewrite entity summaries from atomic facts",
        status: "active" as const,
        lastRun: now - 3 * 24 * hour,
        nextRun: now + 4 * 24 * hour,
        lastResult: "success",
      },
      {
        name: "OpenRouter Monitor",
        schedule: "0 0 * * *",
        description: "Check OpenRouter balance and usage",
        status: "active" as const,
        lastRun: now - 20 * hour,
        nextRun: now + 4 * hour,
        lastResult: "success",
      },
    ];

    for (const job of jobs) {
      await ctx.db.insert("cronJobs", job);
    }
  },
});
