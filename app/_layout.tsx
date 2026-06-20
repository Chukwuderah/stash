import { ErrorBoundary } from "@/components/Errorboundary";
import { OfflineBanner } from "@/components/Offlinebanner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "./global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

// Clerk token cache (persists session securely between app restarts)

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

function NotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications and save token to Convex
  usePushNotifications();

  useEffect(() => {
    // Fires when the user taps a notification (app in background or closed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const ideaId = response.notification.request.content.data?.ideaId;

        if (typeof ideaId === "string" || typeof ideaId === "number") {
          router.push({
            pathname: "/idea/[id]",
            params: { id: ideaId },
          });
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <NotificationHandler />
            <OfflineBanner />
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="quick-add/index"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                  headerShown: false,
                }}
              />
              <Stack.Screen name="idea/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="collection/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="tag/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="tag-picker"
                options={{
                  presentation: "transparentModal",
                  animation: "slide_from_bottom",
                  headerShown: false,
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </ErrorBoundary>
        </GestureHandlerRootView>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
