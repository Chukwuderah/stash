import Colors from "@/constants/colors";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Seed tags (replace with Convex useQuery later) ───────────────────────────

const SEED_TAGS = [
  "apps",
  "productivity",
  "content",
  "business",
  "creative",
  "dev",
];

const MAX_CHARS = 280;

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function QuickAddScreen() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const snapPoints = useMemo(() => ["55%"], []);
  const charsLeft = MAX_CHARS - text.length;

  // Open sheet and focus input on mount
  useEffect(() => {
    bottomSheetRef.current?.expand();
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleStash() {
    if (!text.trim()) return;
    // TODO: replace with Convex createIdea mutation
    console.log("Stashing:", { text: text.trim(), tags: selectedTags });
    router.back();
  }

  function handleClose() {
    bottomSheetRef.current?.close();
    router.back();
  }

  function handleSheetChange(index: number) {
    if (index === -1) router.back();
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        onPress={handleClose}
      />
    ),
    [],
  );

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: Colors.cardBorder,
          width: 32,
          height: 4,
        }}
        backgroundStyle={{
          backgroundColor: Colors.cardBg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            {/* ── Sheet header ── */}
            <View className="flex-row items-center justify-between px-5 pt-1 pb-2">
              <Text
                className="text-[17px] font-semibold"
                style={{ color: Colors.textPrimary }}
              >
                New idea
              </Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Text
                  className="text-[15px]"
                  style={{ color: Colors.textMuted }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Text input ── */}
            <TextInput
              ref={inputRef}
              className="px-5 py-3 text-[17px] font-medium"
              style={{
                color: Colors.textPrimary,
                minHeight: 80,
                textAlignVertical: "top",
              }}
              placeholder="What's the idea?"
              placeholderTextColor={Colors.accentTeal}
              value={text}
              onChangeText={(val) => val.length <= MAX_CHARS && setText(val)}
              multiline
              autoFocus
              returnKeyType="default"
            />

            {/* ── Divider ── */}
            <View
              className="h-[0.5px] mx-5"
              style={{ backgroundColor: Colors.cardBorder }}
            />

            {/* ── Tag chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                gap: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {SEED_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    className="rounded-full px-3.5 py-1.5"
                    style={{
                      backgroundColor: active
                        ? Colors.brandTeal
                        : Colors.lightTeal,
                    }}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className="text-[13px] font-medium"
                      style={{ color: active ? "#FFFFFF" : Colors.textSubtle }}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* + add new tag */}
              <TouchableOpacity
                className="rounded-full px-3.5 py-1.5 border border-dashed items-center justify-center"
                style={{ borderColor: Colors.brandTeal }}
                activeOpacity={0.75}
              >
                <Text
                  className="text-[18px] leading-5"
                  style={{ color: Colors.brandTeal }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* ── Bottom action row ── */}
            <View
              className="flex-row items-center justify-between px-5 py-3 border-t-[0.5px]"
              style={{ borderColor: Colors.cardBorder }}
            >
              <Text className="text-[13px]" style={{ color: Colors.textMuted }}>
                {text.length} / {MAX_CHARS}
              </Text>

              <TouchableOpacity
                className="rounded-full px-6 py-2.5"
                style={{
                  backgroundColor:
                    text.trim().length > 0
                      ? Colors.brandTeal
                      : Colors.cardBorder,
                }}
                onPress={handleStash}
                activeOpacity={0.8}
                disabled={text.trim().length === 0}
              >
                <Text
                  className="text-[15px] font-semibold"
                  style={{
                    color:
                      text.trim().length > 0 ? "#FFFFFF" : Colors.textMuted,
                  }}
                >
                  Stash it
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
