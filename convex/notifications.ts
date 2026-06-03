import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

// ─── getActiveNudgePrefs ──────────────────────────────────────────────────────
// Returns all users who have daily nudge enabled and a push token saved.

export const getActiveNudgePrefs = internalQuery({
  handler: async (ctx) => {
    const allPrefs = await ctx.db.query("userPreferences").collect();
    return allPrefs.filter((p) => p.dailyNudge && p.pushToken);
  },
});

// ─── getRandomIdea ────────────────────────────────────────────────────────────
// Returns a random active idea for a user, preferring ideas that haven't been
// surfaced recently. Picks from the oldest 30% of the stash for variety.

export const getRandomIdea = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .collect();

    if (ideas.length === 0) return null;

    // Sort by lastSurfacedAt ascending — least recently surfaced first
    const sorted = [...ideas].sort((a, b) => {
      const aTime = a.lastSurfacedAt ?? 0;
      const bTime = b.lastSurfacedAt ?? 0;
      return aTime - bTime;
    });

    // Pick randomly from the oldest 30% so it doesn't always resurface the same idea
    const poolSize = Math.max(1, Math.floor(sorted.length * 0.3));
    const pool = sorted.slice(0, poolSize);
    return pool[Math.floor(Math.random() * pool.length)];
  },
});

// ─── markSurfaced ─────────────────────────────────────────────────────────────
// Updates lastSurfacedAt so the same idea isn't immediately resurfaced tomorrow.

export const markSurfaced = internalMutation({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ideaId, { lastSurfacedAt: Date.now() });
  },
});

// ─── resurface ────────────────────────────────────────────────────────────────
// The main action triggered by the cron job.
// For each user with nudge enabled:
//   1. Pick a random old idea
//   2. Send a push notification via Expo's push API
//   3. Mark the idea as surfaced

export const resurface = internalAction({
  handler: async (ctx) => {
    const prefs = await ctx.runQuery(
      internal.notifications.getActiveNudgePrefs,
    );

    for (const pref of prefs) {
      if (!pref.pushToken) continue;

      const idea = await ctx.runQuery(internal.notifications.getRandomIdea, {
        userId: pref.userId,
      });

      if (!idea) continue;

      // Truncate long ideas for the notification body
      const body =
        idea.text.length > 100 ? idea.text.slice(0, 97) + "..." : idea.text;

      // Send via Expo's push API
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify({
          to: pref.pushToken,
          sound: "default",
          title: "💡 Idea from your stash",
          body,
          // ideaId is passed so the app can deep link on tap
          data: { ideaId: idea._id },
        }),
      });

      if (!response.ok) {
        console.error(
          `Push failed for user ${pref.userId}:`,
          await response.text(),
        );
        continue;
      }

      // Mark so it won't be immediately picked again tomorrow
      await ctx.runMutation(internal.notifications.markSurfaced, {
        ideaId: idea._id,
      });
    }
  },
});
