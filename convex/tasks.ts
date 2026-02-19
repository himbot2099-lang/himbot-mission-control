import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { assignee: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.assignee) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee as "ryan" | "himbot"))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status as "backlog" | "in_progress" | "review" | "done"))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("backlog"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
    assignee: v.union(v.literal("ryan"), v.literal("himbot")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("backlog"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("backlog"), v.literal("in_progress"), v.literal("review"), v.literal("done"))),
    assignee: v.optional(v.union(v.literal("ryan"), v.literal("himbot"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tasks").collect();
    return {
      total: all.length,
      backlog: all.filter((t) => t.status === "backlog").length,
      in_progress: all.filter((t) => t.status === "in_progress").length,
      review: all.filter((t) => t.status === "review").length,
      done: all.filter((t) => t.status === "done").length,
    };
  },
});
