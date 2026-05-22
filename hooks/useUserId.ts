import { useAuth } from "@clerk/clerk-expo";

/**
 * Returns the current Clerk userId as a guaranteed string.
 * Safe to use inside protected routes — the tabs layout
 * already redirects unauthenticated users before any tab
 * screen renders.
 */
export function useUserId(): string {
  const { userId } = useAuth();
  return userId!;
}
