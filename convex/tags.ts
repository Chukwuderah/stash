import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── getTags ──────────────────────────────────────────────────────────────────

export const getTags = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const linkedIdeas = await ctx.db
          .query("ideaTags")
          .withIndex("by_tag", (q) => q.eq("tagId", tag._id))
          .collect();

        return { ...tag, ideaCount: linkedIdeas.length };
      }),
    );

    return tagsWithCount.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// ─── getTagById ───────────────────────────────────────────────────────────────

export const getTagById = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tagId);
  },
});

// ─── createTag ────────────────────────────────────────────────────────────────

export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", {
      name: args.name,
      color: args.color,
      userId: args.userId,
    });
  },
});

// ─── updateTag ────────────────────────────────────────────────────────────────

export const updateTag = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tagId, ...fields } = args;
    await ctx.db.patch(tagId, fields);
  },
});

// ─── deleteTag ────────────────────────────────────────────────────────────────

export const deleteTag = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const linkedIdeas = await ctx.db
      .query("ideaTags")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .collect();

    await Promise.all(linkedIdeas.map((r) => ctx.db.delete(r._id)));
    await ctx.db.delete(args.tagId);
  },
});
