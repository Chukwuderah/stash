import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { tagSelection } from "@/utils/tagSelection";
import { AntDesign } from "@expo/vector-icons";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const MAX_CHARS = 280;

// Main screen

export default function QuickAddScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<Id<"tags">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const pending = tagSelection.get();
      if (pending.length > 0) {
        setSelectedTags(pending);
        tagSelection.clear();
      }
    }, []),
  );

  const snapPoints = useMemo(() => ["85%", "92%"], []);

  // Convex
  const tags = useQuery(api.tags.getTags, !isAuthenticated ? "skip" : {});
  const createIdea = useMutation(api.ideas.createIdea);

  useEffect(() => {
    bottomSheetRef.current?.expand();
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  // Handlers

  function toggleTag(tagId: Id<"tags">) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  async function handleStash() {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createIdea({
        text: text.trim(),
        tagIds: selectedTags,
      });
      router.back();
    } catch (error) {
      console.error("Failed to create idea:", error);
      setIsSubmitting(false);
    }
  }

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    router.back();
  }, [router]);

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
    [handleClose],
  );

  const canSubmit = text.trim().length > 0 && !isSubmitting;
  const isLoading = isAuthenticated && tags === undefined;

  return (
    <View className="flex-1">
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
            {/* ── Header ── */}
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
              placeholder="What's the big idea?"
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
              {isLoading && (
                <ActivityIndicator size="small" color={Colors.brandTeal} />
              )}

              {tags?.map((tag) => {
                const active = selectedTags.includes(tag._id);
                return (
                  <TouchableOpacity
                    key={tag._id}
                    className="rounded-full px-3.5 py-1.5"
                    style={{
                      backgroundColor: active
                        ? Colors.brandTeal
                        : Colors.lightTeal,
                    }}
                    onPress={() => toggleTag(tag._id)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className="text-[13px] font-medium"
                      style={{ color: active ? "#FFFFFF" : Colors.textSubtle }}
                    >
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Open full tag picker */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tag-picker",
                    params: { selected: JSON.stringify(selectedTags) },
                  })
                }
                className="rounded-full px-3.5 py-1.5 border border-dashed items-center justify-center"
                style={{ borderColor: Colors.brandTeal }}
                activeOpacity={0.75}
              >
                <AntDesign name="plus" size={16} color={Colors.brandTeal} />
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
                className="rounded-full px-6 py-2.5 items-center justify-center"
                style={{
                  backgroundColor: canSubmit
                    ? Colors.brandTeal
                    : Colors.cardBorder,
                  minWidth: 96,
                }}
                onPress={handleStash}
                activeOpacity={0.8}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    className="text-[15px] font-semibold"
                    style={{ color: canSubmit ? "#FFFFFF" : Colors.textMuted }}
                  >
                    Stash it
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
