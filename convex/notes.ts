import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addNote = mutation({
  args: {
    ideaId: v.id("ideas"),
    text: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      ideaId: args.ideaId,
      text: args.text,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});
