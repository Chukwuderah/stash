import colors from "@/constants/colors";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: colors.primaryDark }}
    >
      <SafeAreaView>
        <Text>SignUpScreen</Text>
      </SafeAreaView>
    </View>
  );
}
