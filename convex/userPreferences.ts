import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Default preferences ──────────────────────────────────────────────────────

const DEFAULTS = {
  dailyNudge: true,
  cadence: "Daily" as const,
  agingThreshold: "30 days" as const,
  sortOrder: "Newest first" as const,
};

// ─── getUserPreferences ───────────────────────────────────────────────────────
// Returns null if the user has never saved preferences.
// The screen falls back to DEFAULTS in that case.

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// ─── setUserPreferences ───────────────────────────────────────────────────────
// Upserts preferences — creates on first call, patches on subsequent calls.
// All fields are optional so you can update just one at a time.

export const setUserPreferences = mutation({
  args: {
    userId: v.string(),
    dailyNudge: v.optional(v.boolean()),
    cadence: v.optional(
      v.union(
        v.literal("Daily"),
        v.literal("Every 2 days"),
        v.literal("Weekly"),
      ),
    ),
    agingThreshold: v.optional(
      v.union(v.literal("30 days"), v.literal("60 days"), v.literal("90 days")),
    ),
    sortOrder: v.optional(
      v.union(v.literal("Newest first"), v.literal("Oldest first")),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Patch only the fields that were provided
      await ctx.db.patch(existing._id, fields);
    } else {
      // First save — merge provided fields with defaults
      await ctx.db.insert("userPreferences", {
        userId,
        dailyNudge: fields.dailyNudge ?? DEFAULTS.dailyNudge,
        cadence: fields.cadence ?? DEFAULTS.cadence,
        agingThreshold: fields.agingThreshold ?? DEFAULTS.agingThreshold,
        sortOrder: fields.sortOrder ?? DEFAULTS.sortOrder,
      });
    }
  },
});
