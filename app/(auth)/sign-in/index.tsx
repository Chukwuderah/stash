import Colors from "@/constants/colors";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    if (!isLoaded || isLoading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert(
        "Sign in failed",
        err.errors?.[0]?.longMessage ??
          "Invalid email or password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.primaryDark }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 pt-20 pb-8">
            {/* ── Brand block ── */}
            <View className="items-center mb-12">
              {/* Icon */}
              <Image
                source={require("@/assets/splash-logo-light.png")}
                className="w-28 h-28"
              />

              <Text
                className="text-[36px] font-semibold mt-4"
                style={{ color: Colors.textOnDark }}
              >
                Stash
              </Text>
              <Text
                className="text-[16px] mt-1.5"
                style={{ color: Colors.accentTeal }}
              >
                Your ideas, parked safely
              </Text>
            </View>

            {/* ── Form ── */}
            <View className="px-7 gap-3">
              {/* Email */}
              <View
                className="flex-row items-center rounded-xl px-4 py-[10px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <TextInput
                  className="flex-1 text-[15px]"
                  style={{ color: Colors.textOnDark }}
                  placeholder="Email address"
                  placeholderTextColor={Colors.accentTeal}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View
                className="flex-row items-center rounded-xl px-4 py-[10px]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <TextInput
                  className="flex-1 text-[15px]"
                  style={{ color: Colors.textOnDark }}
                  placeholder="Password"
                  placeholderTextColor={Colors.accentTeal}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={Colors.accentTeal}
                  />
                </TouchableOpacity>
              </View>

              {/* Sign in button */}
              <TouchableOpacity
                className="rounded-[14px] py-[15px] items-center mt-2"
                style={{ backgroundColor: Colors.brandTeal }}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.textOnDark} />
                ) : (
                  <Text
                    className="text-[16px] font-semibold"
                    style={{ color: Colors.textOnDark }}
                  >
                    Sign in
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center gap-3 my-1">
                <View
                  className="flex-1 h-[0.5px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                />
                <Text
                  className="text-[14px]"
                  style={{ color: Colors.accentTeal }}
                >
                  or
                </Text>
                <View
                  className="flex-1 h-[0.5px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                />
              </View>

              {/* Google */}
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-[14px] py-[13px] gap-3 border-[0.5px] pb-2.5"
                style={{ borderColor: Colors.textOnDark }}
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert(
                    "Coming soon",
                    "Google sign-in will be available soon.",
                  )
                }
              >
                <Ionicons
                  name="logo-google"
                  size={18}
                  color={Colors.textOnDark}
                />
                <Text
                  className="text-[15px]"
                  style={{ color: Colors.textOnDark }}
                >
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Toggle to sign up */}
              <TouchableOpacity
                className="items-center py-2 mt-2"
                onPress={() => router.replace("/(auth)/sign-up")}
                activeOpacity={0.7}
              >
                <Text
                  className="text-[14px]"
                  style={{ color: Colors.accentTeal }}
                >
                  Don&apos;t have an account?{" "}
                  <Text
                    className="font-semibold"
                    style={{ color: Colors.textOnDark }}
                  >
                    Sign up
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
