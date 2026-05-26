import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── getTags ──────────────────────────────────────────────────────────────────

export const getTags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
    const userId = await requireAuth(ctx);

    const tag = await ctx.db.get(args.tagId);
    if (!tag) return null;

    // SECURITY: Ensure user owns this tag
    if (tag.userId !== userId) throw new Error("Unauthorized");

    return tag;
  },
});

// ─── createTag ────────────────────────────────────────────────────────────────

export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    return await ctx.db.insert("tags", {
      name: args.name,
      color: args.color,
      userId,
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
    const userId = await requireAuth(ctx);
    const { tagId, ...fields } = args;

    // SECURITY: Ensure user owns this tag before modifying
    const tag = await ctx.db.get(tagId);
    if (!tag) throw new Error("Tag not found");
    if (tag.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(tagId, fields);
  },
});

// ─── deleteTag ────────────────────────────────────────────────────────────────

export const deleteTag = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure user owns this tag before deleting
    const tag = await ctx.db.get(args.tagId);
    if (!tag) throw new Error("Tag not found");
    if (tag.userId !== userId) throw new Error("Unauthorized");

    const linkedIdeas = await ctx.db
      .query("ideaTags")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .collect();

    await Promise.all(linkedIdeas.map((r) => ctx.db.delete(r._id)));
    await ctx.db.delete(args.tagId);
  },
});
