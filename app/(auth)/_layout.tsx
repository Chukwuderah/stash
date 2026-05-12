import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="signUp/index" options={{ headerShown: false }} />
      <Stack.Screen name="signIn/index" options={{ headerShown: false }} />
    </Stack>
  );
}
