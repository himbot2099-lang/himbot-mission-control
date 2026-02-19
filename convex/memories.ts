import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("memories")
        .withIndex("by_type", (q) => q.eq("type", args.type as "daily" | "entity" | "lesson" | "decision" | "core"))
        .collect();
    }
    return await ctx.db.query("memories").collect();
  },
});

export const get = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("memories").collect();
    const q = args.query.toLowerCase();
    return all.filter(
      (m) =>
        m.path.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        (m.title && m.title.toLowerCase().includes(q))
    );
  },
});

export const upsert = mutation({
  args: {
    path: v.string(),
    content: v.string(),
    type: v.union(v.literal("daily"), v.literal("entity"), v.literal("lesson"), v.literal("decision"), v.literal("core")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, lastModified: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("memories", { ...args, lastModified: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
