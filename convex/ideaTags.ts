import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── addTagToIdea ─────────────────────────────────────────────────────────────

export const addTagToIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure the user owns both the idea and the tag
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) throw new Error("Unauthorized");

    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== userId) throw new Error("Unauthorized");

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
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure the user owns the idea before altering its tags
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== userId) throw new Error("Unauthorized");

    const records = await ctx.db
      .query("ideaTags")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    const record = records.find((r) => r.tagId === args.tagId);
    if (record) await ctx.db.delete(record._id);
  },
});
