import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { tagSelection } from "@/utils/tagSelection";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Tag row

function TagRow({
  name,
  color,
  selected,
  onToggle,
}: {
  name: string;
  color: string;
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
      <View
        className="w-[10px] h-[10px] rounded-full mr-4"
        style={{ backgroundColor: color }}
      />
      <Text
        className="flex-1 text-[15px]"
        style={{ color: Colors.textPrimary }}
      >
        {name}
      </Text>
      {selected && (
        <Ionicons name="checkmark" size={18} color={Colors.brandTeal} />
      )}
    </TouchableOpacity>
  );
}

// Create tag row

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
        Create <Text className="font-semibold">&apos;{query}&apos;</Text> as a new tag
      </Text>
    </TouchableOpacity>
  );
}

// Tag color palette (cycles when creating new tags)

const TAG_COLORS = [
  "#F97316",
  "#8B5CF6",
  "#0D9488",
  "#F59E0B",
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#94A3B8",
];

// Main screen

export default function TagPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selected?: string; ideaId?: string }>();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => ["75%", "92%"], []);

  // Present when opened from Idea Detail, absent from Quick Add
  const ideaId = params.ideaId as Id<"ideas"> | undefined;

  const [selected, setSelected] = useState<Id<"tags">[]>(() => {
    try {
      return params.selected ? JSON.parse(params.selected) : [];
    } catch {
      return [];
    }
  });

  // Snapshot of the initial selection — used to compute diff on Done
  const initialSelected = useMemo<Id<"tags">[]>(() => {
    try {
      return params.selected ? JSON.parse(params.selected) : [];
    } catch {
      return [];
    }
  }, []);

  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Convex
  const tags = useQuery(api.tags.getTags, {});
  const createTag = useMutation(api.tags.createTag);
  const addTagToIdea = useMutation(api.ideaTags.addTagToIdea);
  const removeTagFromIdea = useMutation(api.ideaTags.removeTagFromIdea);

  useEffect(() => {
    bottomSheetRef.current?.expand();
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Filtering

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!query.trim()) return tags;
    return tags.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [tags, query]);

  const showCreate =
    query.trim().length > 0 &&
    tags !== undefined &&
    !tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  // Handlers

  function toggleTag(id: Id<"tags">) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleCreateTag() {
    if (!query.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const color = TAG_COLORS[(tags?.length ?? 0) % TAG_COLORS.length];
      const newTagId = await createTag({
        name: query.trim(),
        color,
      });
      setSelected((prev) => [...prev, newTagId]);
      setQuery("");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDone() {
    if (ideaId) {
      // Opened from Idea Detail — sync tags directly in Convex
      const toAdd = selected.filter((id) => !initialSelected.includes(id));
      const toRemove = initialSelected.filter((id) => !selected.includes(id));

      await Promise.all([
        ...toAdd.map((tagId) => addTagToIdea({ ideaId, tagId })),
        ...toRemove.map((tagId) => removeTagFromIdea({ ideaId, tagId })),
      ]);
    } else {
      // Opened from Quick Add — write to global store, Quick Add reads on focus
      tagSelection.set(selected);
    }

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
          {/* Header */}
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

          {/* Search input */}
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

          {/* Tag list */}
          {tags === undefined ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.brandTeal} />
            </View>
          ) : (
            <BottomSheetFlatList
              data={filteredTags}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TagRow
                  name={item.name}
                  color={item.color}
                  selected={selected.includes(item._id)}
                  onToggle={() => toggleTag(item._id)}
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
                      {query
                        ? `No tags match "${query}"`
                        : "No tags yet — type to create one"}
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
