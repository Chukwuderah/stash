import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── getCollectionById ────────────────────────────────────────────────────────

export const getCollectionById = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return null;

    // SECURITY: Ensure the user owns this collection
    if (collection.userId !== userId) throw new Error("Unauthorized");

    return collection;
  },
});

// ─── getCollections ───────────────────────────────────────────────────────────

export const getCollections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx); // Securely get ID

    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ─── getIdeasByCollection ─────────────────────────────────────────────────────

export const getIdeasByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure the collection exists and belongs to the active user
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId)
      throw new Error("Unauthorized");

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId),
      )
      .order("desc")
      .collect();

    const ideasWithTags = await Promise.all(
      ideas.map(async (idea) => {
        const tagRecords = await ctx.db
          .query("ideaTags")
          .withIndex("by_idea", (q) => q.eq("ideaId", idea._id))
          .collect();

        const tags = await Promise.all(
          tagRecords.map((r) => ctx.db.get(r.tagId)),
        );

        return { ...idea, tags: tags.filter(Boolean) };
      }),
    );

    return ideasWithTags;
  },
});

// ─── createCollection ─────────────────────────────────────────────────────────

export const createCollection = mutation({
  args: {
    name: v.string(),
    // ❌ Removed userId
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    return await ctx.db.insert("collections", {
      name: args.name,
      userId,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

// ─── updateCollection ─────────────────────────────────────────────────────────

export const updateCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const { collectionId, ...fields } = args;

    // SECURITY: Ensure user owns this collection before patching
    const collection = await ctx.db.get(collectionId);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(collectionId, fields);
  },
});

// ─── deleteCollection ─────────────────────────────────────────────────────────

export const deleteCollection = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure user owns this collection before deleting
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Unauthorized");

    // Clear the collection reference from all member ideas
    const memberIdeas = await ctx.db
      .query("ideas")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId),
      )
      .collect();

    await Promise.all(
      memberIdeas.map((idea) =>
        ctx.db.patch(idea._id, {
          collectionId: undefined,
          updatedAt: Date.now(),
        }),
      ),
    );

    await ctx.db.delete(args.collectionId);
  },
});
