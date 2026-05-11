import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─── addTagToIdea ─────────────────────────────────────────────────────────────

export const addTagToIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    // Guard — don't create duplicates
    const existing = await ctx.db
      .query("ideaTags")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    const alreadyLinked = existing.some((r) => r.tagId === args.tagId);
    if (alreadyLinked) return;

    await ctx.db.insert("ideaTags", {
      ideaId: args.ideaId,
      tagId: args.tagId,
    });
  },
});

// ─── removeTagFromIdea ────────────────────────────────────────────────────────

export const removeTagFromIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("ideaTags")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    const record = records.find((r) => r.tagId === args.tagId);
    if (record) await ctx.db.delete(record._id);
  },
});
