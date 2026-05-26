import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── addNote ──────────────────────────────────────────────────────────────────

export const addNote = mutation({
  args: {
    ideaId: v.id("ideas"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // SECURITY: Ensure the idea exists and belongs to the logged-in user
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.userId !== userId) throw new Error("Unauthorized");

    return await ctx.db.insert("notes", {
      ideaId: args.ideaId,
      text: args.text,
      userId,
      createdAt: Date.now(),
    });
  },
});
