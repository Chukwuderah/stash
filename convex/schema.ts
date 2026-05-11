import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ideas: defineTable({
    text: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("complete"),
    ),
    priority: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    ),
    collectionId: v.optional(v.id("collections")),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSurfacedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_collection", ["collectionId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["userId", "status"],
    }),

  tags: defineTable({
    name: v.string(),
    color: v.string(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  ideaTags: defineTable({
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
  })
    .index("by_idea", ["ideaId"])
    .index("by_tag", ["tagId"]),

  collections: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    ideaId: v.id("ideas"),
    text: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_idea", ["ideaId"]),

  userPreferences: defineTable({
    userId: v.string(),
    dailyNudge: v.boolean(),
    cadence: v.union(
      v.literal("Daily"),
      v.literal("Every 2 days"),
      v.literal("Weekly"),
    ),
    agingThreshold: v.union(
      v.literal("30 days"),
      v.literal("60 days"),
      v.literal("90 days"),
    ),
    sortOrder: v.union(v.literal("Newest first"), v.literal("Oldest first")),
  }).index("by_user", ["userId"]),
});
