import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    description: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("error")),
    currentTask: v.optional(v.string()),
    lastActive: v.number(),
    totalRuns: v.number(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("agents", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("error")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      currentTask: args.currentTask,
      lastActive: Date.now(),
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return;

    const agentDefs = [
      { name: "Researcher", role: "Research & Intel", description: "Searches the web, analyzes sources, compiles briefings", status: "idle" as const, avatar: "🔍" },
      { name: "Coder", role: "Software Engineer", description: "Writes, reviews, and debugs code across all languages", status: "idle" as const, avatar: "💻" },
      { name: "Writer", role: "Content & Comms", description: "Drafts emails, docs, posts, and creative content", status: "idle" as const, avatar: "✍️" },
      { name: "Fact Extractor", role: "Memory Manager", description: "Extracts and indexes facts from conversations", status: "working" as const, currentTask: "Running heartbeat extraction" },
      { name: "Monitor", role: "System Watch", description: "Watches for anomalies, alerts, and status changes", status: "idle" as const, avatar: "👁️" },
      { name: "Designer", role: "UI & Visual", description: "Creates mockups, SVGs, and design direction", status: "idle" as const, avatar: "🎨" },
      { name: "Analyst", role: "Data & Metrics", description: "Crunches numbers, builds reports, spots trends", status: "idle" as const, avatar: "📊" },
      { name: "Ops", role: "Operations", description: "Handles integrations, workflows, and infra tasks", status: "idle" as const, avatar: "⚙️" },
    ];

    const now = Date.now();
    for (const agent of agentDefs) {
      await ctx.db.insert("agents", {
        ...agent,
        lastActive: now - Math.floor(Math.random() * 3600000),
        totalRuns: Math.floor(Math.random() * 50),
      });
    }
  },
});
