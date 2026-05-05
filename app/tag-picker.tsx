import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string;
  label: string;
  color: string;
}

// ─── Seed tags (replace with Convex useQuery later) ───────────────────────────

const ALL_TAGS: Tag[] = [
  { id: "t1", label: "apps", color: "#F97316" },
  { id: "t2", label: "content", color: "#8B5CF6" },
  { id: "t3", label: "productivity", color: "#0D9488" },
  { id: "t4", label: "business", color: "#F59E0B" },
  { id: "t5", label: "creative", color: "#EC4899" },
  { id: "t6", label: "dev", color: "#3B82F6" },
  { id: "t7", label: "research", color: "#10B981" },
  { id: "t8", label: "misc", color: "#94A3B8" },
];

// ─── Tag row ──────────────────────────────────────────────────────────────────

function TagRow({
  tag,
  selected,
  onToggle,
}: {
  tag: Tag;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-4 border-b-[0.5px]"
      style={{ borderColor: Colors.cardBorder }}
      onPress={onToggle}
      activeOpacity={0.65}
    >
      {/* Colour dot */}
      <View
        className="w-[10px] h-[10px] rounded-full mr-4"
        style={{ backgroundColor: tag.color }}
      />

      {/* Label */}
      <Text
        className="flex-1 text-[15px]"
        style={{ color: Colors.textPrimary }}
      >
        {tag.label}
      </Text>

      {/* Checkmark */}
      {selected && (
        <Ionicons name="checkmark" size={18} color={Colors.brandTeal} />
      )}
    </TouchableOpacity>
  );
}

// ─── Create row (shown when query has no match) ───────────────────────────────

function CreateTagRow({
  query,
  onCreate,
}: {
  query: string;
  onCreate: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-5 py-4 border-b-[0.5px]"
      style={{ borderColor: Colors.cardBorder }}
      onPress={onCreate}
      activeOpacity={0.65}
    >
      <Ionicons name="add-circle-outline" size={18} color={Colors.brandTeal} />
      <Text className="ml-3 text-[15px]" style={{ color: Colors.brandTeal }}>
        Create <Text className="font-semibold">"{query}"</Text> as a new tag
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

/**
 * HOW TO OPEN FROM IDEA DETAIL:
 *   router.push({
 *     pathname: "/tag-picker",
 *     params: { selected: JSON.stringify(currentTagIds) },
 *   });
 *
 * HOW TO OPEN FROM QUICK ADD:
 *   router.push({
 *     pathname: "/tag-picker",
 *     params: { selected: JSON.stringify(selectedTagIds) },
 *   });
 *
 * HOW TO RECEIVE THE RESULT:
 *   Use a shared Zustand store or Convex optimistic update.
 *   When the user taps Done, call your mutation/store update
 *   then router.back() — the parent screen re-renders with new tags.
 */

export default function TagPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selected?: string }>();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => ["75%", "92%"], []);

  // Pre-populate selection from params (tags already on the idea)
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      return params.selected ? JSON.parse(params.selected) : [];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");

  useEffect(() => {
    bottomSheetRef.current?.expand();
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!query.trim()) return ALL_TAGS;
    return ALL_TAGS.filter((t) =>
      t.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  // Show "Create" row when query has text but no exact match
  const showCreate =
    query.trim().length > 0 &&
    !ALL_TAGS.some((t) => t.label.toLowerCase() === query.toLowerCase());

  function toggleTag(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function handleCreateTag() {
    // TODO: Convex createTag mutation, then add new id to selected
    const newTag: Tag = {
      id: `new-${Date.now()}`,
      label: query.trim(),
      color: Colors.brandTeal,
    };
    ALL_TAGS.push(newTag); // temp — replace with Convex mutation
    setSelected((prev) => [...prev, newTag.id]);
    setQuery("");
  }

  function handleDone() {
    // TODO: pass selected back via Zustand store or Convex mutation
    // e.g. useIdeaStore.getState().setTags(selected)
    console.log("Selected tags:", selected);
    bottomSheetRef.current?.close();
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
          backgroundColor: Colors.accentTeal,
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
          {/* ── Header ── */}
          <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
            <Text
              className="text-[17px] font-semibold"
              style={{ color: Colors.textPrimary }}
            >
              Add tags
            </Text>
            <TouchableOpacity onPress={handleDone} activeOpacity={0.7}>
              <Text
                className="text-[15px] font-semibold"
                style={{ color: Colors.brandTeal }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Search input ── */}
          <View
            className="flex-row items-center gap-3 mx-4 mb-3 px-4 py-3 rounded-xl border-[0.5px]"
            style={{
              backgroundColor: Colors.screenBg,
              borderColor: Colors.cardBorder,
            }}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={Colors.textMuted}
            />
            <TextInput
              ref={inputRef}
              className="flex-1 text-[15px]"
              style={{ color: Colors.textPrimary }}
              placeholder="Search or create..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Tag list ── */}
          <BottomSheetFlatList
            data={filteredTags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TagRow
                tag={item}
                selected={selected.includes(item.id)}
                onToggle={() => toggleTag(item.id)}
              />
            )}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
            ListHeaderComponent={
              showCreate ? (
                <CreateTagRow query={query} onCreate={handleCreateTag} />
              ) : null
            }
            ListEmptyComponent={
              !showCreate ? (
                <View className="items-center pt-10 gap-2">
                  <Text
                    className="text-[14px]"
                    style={{ color: Colors.textMuted }}
                  >
                    No tags match "{query}"
                  </Text>
                </View>
              ) : null
            }
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
