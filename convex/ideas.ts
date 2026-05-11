import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── getIdeas ─────────────────────────────────────────────────────────────────

export const getIdeas = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .order("desc")
      .collect();

    const ideasWithTags = await Promise.all(
      ideas.map(async (idea) => {
        const ideaTagRecords = await ctx.db
          .query("ideaTags")
          .withIndex("by_idea", (q) => q.eq("ideaId", idea._id))
          .collect();

        const tags = await Promise.all(
          ideaTagRecords.map((record) => ctx.db.get(record.tagId)),
        );

        return { ...idea, tags: tags.filter(Boolean) };
      }),
    );

    return ideasWithTags;
  },
});

// ─── getIdeaById ──────────────────────────────────────────────────────────────

export const getIdeaById = query({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) return null;

    const ideaTagRecords = await ctx.db
      .query("ideaTags")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    const tags = await Promise.all(
      ideaTagRecords.map((r) => ctx.db.get(r.tagId)),
    );

    const collection = idea.collectionId
      ? await ctx.db.get(idea.collectionId)
      : null;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .order("asc")
      .collect();

    return {
      ...idea,
      tags: tags.filter(Boolean),
      collection: collection ?? null,
      notes,
    };
  },
});

// ─── getIdeasByTag ────────────────────────────────────────────────────────────

export const getIdeasByTag = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const ideaTagRecords = await ctx.db
      .query("ideaTags")
      .withIndex("by_tag", (q) => q.eq("tagId", args.tagId))
      .collect();

    const ideas = await Promise.all(
      ideaTagRecords.map(async (record) => {
        const idea = await ctx.db.get(record.ideaId);
        if (!idea) return null;

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

    return ideas.filter(Boolean).sort((a, b) => b!.createdAt - a!.createdAt);
  },
});

// ─── searchIdeas ──────────────────────────────────────────────────────────────
// Full-text search using the search_text index. Returns empty array when query
// is blank — the screen handles the empty state.
// Status filtering happens client-side on the returned results.

export const searchIdeas = query({
  args: {
    userId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    const ideas = await ctx.db
      .query("ideas")
      .withSearchIndex("search_text", (q) =>
        q.search("text", args.query).eq("userId", args.userId),
      )
      .take(25);

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

// ─── createIdea ───────────────────────────────────────────────────────────────

export const createIdea = mutation({
  args: {
    text: v.string(),
    userId: v.string(),
    priority: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    ),
    tagIds: v.optional(v.array(v.id("tags"))),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ideaId = await ctx.db.insert("ideas", {
      text: args.text,
      userId: args.userId,
      status: "active",
      priority: args.priority,
      collectionId: args.collectionId,
      createdAt: now,
      updatedAt: now,
    });

    if (args.tagIds?.length) {
      await Promise.all(
        args.tagIds.map((tagId) =>
          ctx.db.insert("ideaTags", { ideaId, tagId }),
        ),
      );
    }

    return ideaId;
  },
});

// ─── updateIdea ───────────────────────────────────────────────────────────────

export const updateIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    text: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("archived"),
        v.literal("complete"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    ),
  },
  handler: async (ctx, args) => {
    const { ideaId, ...fields } = args;
    await ctx.db.patch(ideaId, { ...fields, updatedAt: Date.now() });
  },
});
