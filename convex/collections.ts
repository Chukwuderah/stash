import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// getCollectionById

export const getCollectionById = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.collectionId);
  },
});

// getCollections

export const getCollections = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// getIdeasByCollection
// Returns all ideas in a collection (all statuses) with tags populated.
// Priority filtering happens client-side.

export const getIdeasByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
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

// createCollection─

export const createCollection = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collections", {
      name: args.name,
      userId: args.userId,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

// updateCollection─

export const updateCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { collectionId, ...fields } = args;
    await ctx.db.patch(collectionId, fields);
  },
});

// deleteCollection
// Deletes the collection and clears collectionId on all its ideas
// so no idea is left with a dangling reference.

export const deleteCollection = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
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
