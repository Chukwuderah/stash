import Colors from "@/constants/colors";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSignUp() {
    if (!isLoaded || isLoading) return;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const firstName = fullName.trim().split(" ")[0];
      const lastName =
        fullName.trim().split(" ").slice(1).join(" ") || undefined;

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email.trim(),
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      Alert.alert(
        "Sign up failed",
        err.errors?.[0]?.longMessage ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded || isVerifying) return;

    if (!code.trim()) {
      Alert.alert(
        "Enter code",
        "Please enter the verification code from your email.",
      );
      return;
    }

    setIsVerifying(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert(
        "Verification failed",
        err.errors?.[0]?.longMessage ?? "Invalid code. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    if (!signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Code resent", `A new code was sent to ${email}`);
    } catch {
      Alert.alert("Error", "Could not resend code. Please try again.");
    }
  }

  if (step === "verify") {
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
          >
            <View className="flex-1 px-7 pt-20">
              {/* Icon */}
              <View className="items-center mb-8">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: Colors.brandTeal }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={32}
                    color={Colors.lightTeal}
                  />
                </View>
                <Text
                  className="text-[28px] font-semibold text-center mb-2"
                  style={{ color: Colors.textOnDark }}
                >
                  Check your email
                </Text>
                <Text
                  className="text-[15px] text-center leading-6"
                  style={{ color: Colors.accentTeal }}
                >
                  We sent a 6-digit code to{"\n"}
                  <Text className="font-semibold">{email}</Text>
                </Text>
              </View>

              {/* Code input */}
              <TextInput
                className="rounded-xl px-4 py-[10px] text-[20px] text-center font-semibold tracking-widest mb-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.15)",
                  color: Colors.textOnDark,
                }}
                placeholder="000000"
                placeholderTextColor={Colors.accentTeal}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              {/* Verify button */}
              <TouchableOpacity
                className="rounded-[14px] py-[15px] items-center mb-5"
                style={{ backgroundColor: Colors.brandTeal }}
                onPress={handleVerify}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                {isVerifying ? (
                  <ActivityIndicator color={Colors.textOnDark} />
                ) : (
                  <Text
                    className="text-[16px] font-semibold"
                    style={{ color: Colors.textOnDark }}
                  >
                    Verify email
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <TouchableOpacity
                className="items-center py-2"
                onPress={handleResendCode}
                activeOpacity={0.7}
              >
                <Text
                  className="text-[14px]"
                  style={{ color: Colors.accentTeal }}
                >
                  Didn't get it?{" "}
                  <Text
                    className="font-semibold"
                    style={{ color: Colors.textOnDark }}
                  >
                    Resend code
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Back */}
              <TouchableOpacity
                className="items-center py-4 mt-2"
                onPress={() => setStep("form")}
                activeOpacity={0.7}
              >
                <Text
                  className="text-[14px]"
                  style={{ color: Colors.accentTeal }}
                >
                  ← Back to sign up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign up form UI
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
          <View className="flex-1 pt-16 pb-8">
            {/* ── Brand block ── */}
            <View className="items-center mb-9">
              {/* Icon */}
              <View
                className="rounded-full border-2 border-black w-20 h-20 p-2 flex items-center justify-center"
                style={{ backgroundColor: Colors.brandTeal }}
              >
                <MaterialCommunityIcons
                  name="archive-outline"
                  size={40}
                  color="black"
                />
              </View>
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
              {/* Full name */}
              <View
                className="flex-row items-center rounded-xl px-4 py-[10px] gap-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={Colors.accentTeal}
                />
                <TextInput
                  className="flex-1 text-[15px]"
                  style={{ color: Colors.textOnDark }}
                  placeholder="Full name"
                  placeholderTextColor={Colors.accentTeal}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

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
                  placeholder="Create a password"
                  placeholderTextColor={Colors.accentTeal}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
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

              {/* Create account button */}
              <TouchableOpacity
                className="rounded-[14px] py-[15px] items-center mt-2"
                style={{ backgroundColor: Colors.brandTeal }}
                onPress={handleSignUp}
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
                    Create account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center gap-3 my-3">
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
                className="flex-row items-center justify-center rounded-[14px] py-[13px] gap-3 border-[0.5px]"
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

              {/* Apple */}
              {/* <TouchableOpacity
                className="flex-row items-center justify-center rounded-[14px] py-[13px] gap-3 border-[0.5px]"
                style={{ borderColor: Colors.textOnDark }}
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert(
                    "Coming soon",
                    "Apple sign-in will be available soon.",
                  )
                }
              >
                <Ionicons
                  name="logo-apple"
                  size={18}
                  color={Colors.textOnDark}
                />
                <Text
                  className="text-[15px]"
                  style={{ color: Colors.textOnDark }}
                >
                  Continue with Apple
                </Text>
              </TouchableOpacity> */}

              {/* Terms */}
              <Text
                className="text-[12px] text-center leading-5 mt-3 px-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                By signing up, you agree to our{" "}
                <Text style={{ color: Colors.accentTeal }}>Terms</Text> and{" "}
                <Text style={{ color: Colors.accentTeal }}>Privacy Policy</Text>
              </Text>

              {/* Toggle to sign in */}
              <TouchableOpacity
                className="items-center py-2 mt-1"
                onPress={() => router.replace("/(auth)/sign-in")}
                activeOpacity={0.7}
              >
                <Text
                  className="text-[14px]"
                  style={{ color: Colors.accentTeal }}
                >
                  Already have an account?{" "}
                  <Text
                    className="font-semibold"
                    style={{ color: Colors.textOnDark }}
                  >
                    Sign in
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
