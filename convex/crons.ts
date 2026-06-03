import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "daily idea resurface",
  { hourUTC: 9, minuteUTC: 0 }, // Adjust to your preferred time
  internal.notifications.resurface,
);

export default crons;
