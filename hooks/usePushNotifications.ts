import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Platform } from "react-native";

// ─── Foreground notification behaviour ────────────────────────────────────────
// Call this once at the top of your app (outside any component).
// Controls how notifications appear when the app is already open.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Newer NotificationBehavior includes banner/list flags on some platforms
    // Provide all fields to satisfy the type.
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── usePushNotifications ─────────────────────────────────────────────────────
// Call inside the root authenticated layout.
// Requests permission, gets the Expo push token, saves it to Convex.

export function usePushNotifications() {
  const { isAuthenticated } = useConvexAuth();
  const setPrefs = useMutation(api.userPreferences.setUserPreferences);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        console.log("Here is the Expo Push Token:", token);

        setPrefs({ pushToken: token }).catch(console.error);
      }
    });
  }, [isAuthenticated]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on real devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Stash",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0D9488",
    });
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied.");
    return null;
  }

  // Get the Expo push token — requires your EAS project ID
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.error(
      "No EAS project ID found. Run `eas init` or add it to app.json under extra.eas.projectId",
    );
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token;
}
