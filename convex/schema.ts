import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    assignee: v.union(v.literal("ryan"), v.literal("himbot")),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  activities: defineTable({
    type: v.string(),
    description: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_timestamp", ["timestamp"]),

  agents: defineTable({
    name: v.string(),
    role: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("error")
    ),
    currentTask: v.optional(v.string()),
    lastActive: v.number(),
    totalRuns: v.number(),
    avatar: v.optional(v.string()),
  }),

  memories: defineTable({
    path: v.string(),
    content: v.string(),
    lastModified: v.number(),
    type: v.union(
      v.literal("daily"),
      v.literal("entity"),
      v.literal("lesson"),
      v.literal("decision"),
      v.literal("core")
    ),
    title: v.optional(v.string()),
  })
    .index("by_path", ["path"])
    .index("by_type", ["type"]),

  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("disabled")),
    lastResult: v.optional(v.string()),
    description: v.optional(v.string()),
  }),
});
