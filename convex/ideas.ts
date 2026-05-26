import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── getIdeas ─────────────────────────────────────────────────────────────────

export const getIdeas = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user_status", (q: any) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .order("desc")
      .collect();

    const ideasWithTags = await Promise.all(
      ideas.map(async (idea: any) => {
        const ideaTagRecords = await ctx.db
          .query("ideaTags")
          .withIndex("by_idea", (q: any) => q.eq("ideaId", idea._id))
          .collect();

        const tags = await Promise.all(
          ideaTagRecords.map((record: any) => ctx.db.get(record.tagId)),
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
    const userId = await requireAuth(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) return null;

    // SECURITY: Ensure the user actually owns this idea
    if (idea.userId !== userId) throw new Error("Unauthorized");

    const ideaTagRecords = await ctx.db
      .query("ideaTags")
      .withIndex("by_idea", (q: any) => q.eq("ideaId", args.ideaId))
      .collect();

    const tags = await Promise.all(
      ideaTagRecords.map((r: any) => ctx.db.get(r.tagId)),
    );

    const collection = idea.collectionId
      ? await ctx.db.get(idea.collectionId)
      : null;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_idea", (q: any) => q.eq("ideaId", args.ideaId))
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
    const userId = await requireAuth(ctx);

    const ideaTagRecords = await ctx.db
      .query("ideaTags")
      .withIndex("by_tag", (q: any) => q.eq("tagId", args.tagId))
      .collect();

    const ideas = await Promise.all(
      ideaTagRecords.map(async (record) => {
        const idea = await ctx.db.get(record.ideaId);

        // SECURITY: Ensure idea exists AND belongs to the requesting user
        if (!idea || idea.userId !== userId) return null;

        const tagRecords = await ctx.db
          .query("ideaTags")
          .withIndex("by_idea", (q: any) => q.eq("ideaId", idea._id))
          .collect();

        const tags = await Promise.all(
          tagRecords.map((r: any) => ctx.db.get(r.tagId)),
        );

        return { ...idea, tags: tags.filter(Boolean) };
      }),
    );

    return ideas
      .filter(Boolean)
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// ─── searchIdeas ──────────────────────────────────────────────────────────────

export const searchIdeas = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    if (!args.query.trim()) return [];

    const ideas = await ctx.db
      .query("ideas")
      .withSearchIndex("search_text", (q: any) =>
        q.search("text", args.query).eq("userId", userId),
      )
      .take(25);

    const ideasWithTags = await Promise.all(
      ideas.map(async (idea) => {
        const tagRecords = await ctx.db
          .query("ideaTags")
          .withIndex("by_idea", (q: any) => q.eq("ideaId", idea._id))
          .collect();

        const tags = await Promise.all(
          tagRecords.map((r: any) => ctx.db.get(r.tagId)),
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
    priority: v.optional(
      v.union(v.literal("hot"), v.literal("warm"), v.literal("cold")),
    ),
    tagIds: v.optional(v.array(v.id("tags"))),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();

    const ideaId = await ctx.db.insert("ideas", {
      text: args.text,
      userId,
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
    const userId = await requireAuth(ctx);
    const { ideaId, ...fields } = args;

    // SECURITY: Ensure the idea exists and the user is authorized to edit it
    const idea = await ctx.db.get(ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(ideaId, { ...fields, updatedAt: Date.now() });
  },
});
