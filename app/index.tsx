import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold text-blue-500">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Pressable onPress={() => router.push("/(tabs)")} className="mt-4 rounded bg-blue-500 px-4 py-2">
        <Text>Go To Tabs</Text>
      </Pressable>
    </View>
  );
}
