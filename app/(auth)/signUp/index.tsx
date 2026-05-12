import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.primaryDark }}
    >
      <SafeAreaView className="p-6 flex flex-col justify-center items-center flex-1 gap-3">
        <Text className="text-white text-2xl font-semibold">SignUp Screen</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(auth)/signIn")}
          className="mt-4 px-6 bg-white w-full rounded-xl min-h-[62px] flex items-center justify-center"
        >
          <Text className="text-2xl font-semibold">Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)")}
          className="mt-4 px-6 bg-white w-full rounded-xl min-h-[62px] flex items-center justify-center"
        >
          <Text className="text-2xl font-semibold">Go to Tabs</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
