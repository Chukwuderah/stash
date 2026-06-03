import colors from "@/constants/colors";
import { useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // ── Auth gate ─────────────────────────────────────────────────────────────
  // Runs once Clerk has resolved the session from secure storage.
  // Signed-in users skip the landing screen entirely.
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn]);

  // Show a minimal spinner while Clerk resolves the session.
  // Prevents the landing screen flashing for returning users.
  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.primaryDark }}
      >
        <ActivityIndicator size="large" color={colors.brandTeal} />
      </View>
    );
  }

  // Already signed in — useEffect will redirect, render nothing here.
  if (isSignedIn) return null;

  // ── Landing screen (unauthenticated) ──────────────────────────────────────

  return (
    <ImageBackground
      source={require("@/assets/idea-bg.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
        className="flex-1"
      >
        <SafeAreaView className="p-6 flex flex-col justify-end flex-1 gap-3">
          <Animated.View
            entering={FadeInDown.delay(300)
              .mass(0.5)
              .stiffness(80)
              .springify(20)}
          >
            <Text className="text-4xl text-white font-extrabold">
              Welcome to Stash
            </Text>
            <Text
              className="text-2xl font-medium mt-2"
              style={{ color: colors.textOnDark }}
            >
              Your personal idea parking lot.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500)
              .mass(0.5)
              .stiffness(80)
              .springify(20)}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/sign-up")}
              className="mt-4 bg-white w-full rounded-xl min-h-[62px] flex items-center justify-center"
            >
              <Text className="text-2xl font-semibold">Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/sign-in")}
              className="mt-3 w-full rounded-xl min-h-[52px] flex items-center justify-center"
            >
              <Text
                className="text-[16px] font-medium"
                style={{ color: colors.accentTeal }}
              >
                Already have an account?{" "}
                <Text
                  className="font-bold"
                  style={{ color: colors.textOnDark }}
                >
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
