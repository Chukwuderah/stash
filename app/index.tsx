import { router } from "expo-router";
import { ImageBackground, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";

export default function Index() {
  return (
    <ImageBackground
      source={require("@/assets/idea-bg.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]} className="flex-1">
        <SafeAreaView className="p-6 flex flex-col justify-end flex-1 gap-3">
          <Animated.View
            entering={FadeInDown.delay(300)
              .mass(0.5)
              .stiffness(80)
              .springify(20)}
          >
            <Text className="text-4xl text-white font-extrabold">Welcome to Stash</Text>
            <Text className="text-2xl font-medium mt-2" style={{ color: colors.textOnDark }}>
              Your personal idea parking lot.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300)
              .mass(0.5)
              .stiffness(80)
              .springify(20)}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)")}
              className="mt-4 bg-white w-full rounded-xl min-h-[62px] flex items-center justify-center"
            >
              <Text className="text-2xl font-semibold">Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
