import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "./global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      </ConvexProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
