import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject as string;
}

// ─── Default preferences ──────────────────────────────────────────────────────

const DEFAULTS = {
  dailyNudge: true,
  cadence: "Daily" as const,
  agingThreshold: "30 days" as const,
  sortOrder: "Newest first" as const,
};

// ─── getUserPreferences ───────────────────────────────────────────────────────

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx); // Securely get ID

    return await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ─── setUserPreferences ───────────────────────────────────────────────────────

export const setUserPreferences = mutation({
  args: {
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
    pushToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx); // Securely get ID
    const fields = args; // Since userId isn't in args, we can use them directly

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
        pushToken: fields.pushToken,
      });
    }
  },
});

// ─── updatePushToken ──────────────────────────────────────────────────────────

export const updatePushToken = mutation({
  args: { pushToken: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // Update existing preferences with the new token
      await ctx.db.patch(existing._id, { pushToken: args.pushToken });
    } else {
      // Fall back to creating preferences if they don't exist yet
      await ctx.db.insert("userPreferences", {
        userId,
        pushToken: args.pushToken,
        dailyNudge: DEFAULTS.dailyNudge,
        cadence: DEFAULTS.cadence,
        agingThreshold: DEFAULTS.agingThreshold,
        sortOrder: DEFAULTS.sortOrder,
      });
    }
  },
});
