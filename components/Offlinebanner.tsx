import Colors from "@/constants/colors";
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const translateY = useState(new Animated.Value(-60))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;

    async function checkConnectivity() {
      try {
        const state = await Network.getNetworkStateAsync();
        const offline = !state.isConnected || !state.isInternetReachable;

        if (!isMounted) return;

        setIsOffline((prev) => {
          if (!prev && offline) setWasOffline(true);
          return !!offline;
        });
      } catch {
        // Silently ignore — can't check network
      }
    }

    // Check immediately on mount
    checkConnectivity();

    // Then poll every 5 seconds
    const interval = setInterval(checkConnectivity, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Animate banner in and out
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOffline ? 0 : -60,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    // Hide the "Back online" flash after 2 seconds
    if (!isOffline && wasOffline) {
      const timer = setTimeout(() => setWasOffline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  const shouldShow = isOffline || (!isOffline && wasOffline);
  if (!shouldShow) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 999,
        transform: [{ translateY }],
      }}
    >
      <View
        className="flex-row items-center justify-center gap-2 py-2.5 px-4"
        style={{
          backgroundColor: isOffline ? "#1C1C1E" : Colors.brandTeal,
        }}
      >
        <View
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isOffline ? Colors.destructive : "#4ADE80",
          }}
        />
        <Text className="text-[13px] font-medium text-white">
          {isOffline
            ? "You're offline — changes will sync when reconnected"
            : "Back online"}
        </Text>
      </View>
    </Animated.View>
  );
}
