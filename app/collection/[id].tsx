import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Priority = "hot" | "warm" | "cold" | null;
type Filter = "all" | "hot" | "warm" | "cold";

const PRIORITY_BAR: Record<NonNullable<Priority>, string> = {
  hot: Colors.hot,
  warm: Colors.warm,
  cold: Colors.cold,
};

const FILTER_DOT: Record<Exclude<Filter, "all">, string> = {
  hot: Colors.hot,
  warm: Colors.accentTeal,
  cold: Colors.cold,
};

const AGE_THRESHOLD_DAYS = 30;

function getDaysOld(createdAt: number): number {
  return Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
}

function formatRelativeTime(daysOld: number): string {
  if (daysOld === 0) return "Today";
  if (daysOld === 1) return "1d ago";
  if (daysOld < 7) return `${daysOld}d ago`;
  if (daysOld < 30) return `${Math.floor(daysOld / 7)}w ago`;
  return `${Math.floor(daysOld / 30)}mo ago`;
}

function TagPill({ label }: { label: string }) {
  return (
    <View
      className="rounded-[10px] px-2 py-0.5"
      style={{ backgroundColor: Colors.lightTeal }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: Colors.textSubtle }}
      >
        {label}
      </Text>
    </View>
  );
}

function AgeBadge({ days }: { days: number }) {
  return (
    <View
      className="rounded-[10px] px-2 py-0.5"
      style={{ backgroundColor: Colors.ageBadgeBg }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: Colors.ageBadgeText }}
      >
        {days}d old
      </Text>
    </View>
  );
}

function IdeaCard({ idea, onPress }: { idea: any; onPress: () => void }) {
  const daysOld = getDaysOld(idea.createdAt);
  const barColor = idea.priority
    ? PRIORITY_BAR[idea.priority as NonNullable<Priority>]
    : Colors.cardBorder;
  const isAged = daysOld >= AGE_THRESHOLD_DAYS;

  return (
    <TouchableOpacity
      className="flex-row rounded-xl mx-4 mb-2.5 overflow-hidden border-[0.5px]"
      style={{ backgroundColor: Colors.cardBg, borderColor: Colors.cardBorder }}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: barColor }}
      />
      <View className="flex-1 px-3.5 pt-3 pb-2.5">
        {isAged && (
          <View className="absolute top-3 right-3">
            <AgeBadge days={daysOld} />
          </View>
        )}
        <Text
          className="text-base font-medium leading-5 mb-2.5"
          style={{ color: Colors.textPrimary, paddingRight: isAged ? 72 : 0 }}
        >
          {idea.text}
        </Text>
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap gap-1.5 flex-1">
            {idea.tags?.map((tag: any) => (
              <TagPill key={tag._id} label={tag.name} />
            ))}
          </View>
          <Text
            className="text-sm flex-shrink-0"
            style={{ color: Colors.textMuted }}
          >
            {formatRelativeTime(daysOld)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({
  label,
  filter,
  active,
  onPress,
}: {
  label: string;
  filter: Filter;
  active: boolean;
  onPress: () => void;
}) {
  const dot = filter !== "all" ? FILTER_DOT[filter] : null;

  return (
    <TouchableOpacity
      className="flex-row items-center gap-1.5 px-4 py-[7px] rounded-full border"
      style={{
        backgroundColor: active ? Colors.brandTeal : "transparent",
        borderColor: active ? Colors.brandTeal : "rgba(255,255,255,0.25)",
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {dot && (
        <View
          className="w-[7px] h-[7px] rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      <Text
        className="text-[13px]"
        style={{
          color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
          fontWeight: active ? "500" : "400",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Main screen

export default function CollectionScreen() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = id as Id<"collections">;

  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  // Convex
  const collection = useQuery(
    api.collections.getCollectionById,
    !isAuthenticated ? "skip" : { collectionId },
  );
  const ideas = useQuery(
    api.collections.getIdeasByCollection,
    !isAuthenticated ? "skip" : { collectionId },
  );
  const deleteCollection = useMutation(api.collections.deleteCollection);
  const updateCollection = useMutation(api.collections.updateCollection);

  const isLoading = collection === undefined || ideas === undefined;

  // Client-side priority filter
  const filteredIdeas =
    ideas?.filter((idea) => {
      if (activeFilter === "all") return true;
      return idea?.priority === activeFilter;
    }) ?? [];

  // Loading
  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.screenBg }}
      >
        <ActivityIndicator size="large" color={Colors.brandTeal} />
      </View>
    );
  }

  // Not found
  if (!collection) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.screenBg }}
      >
        <Text style={{ color: Colors.textMuted }}>Collection not found</Text>
      </SafeAreaView>
    );
  }

  // Handlers

  function handleOverflowMenu() {
    Alert.alert(collection!.name, "Collection options", [
      { text: "Rename", onPress: handleRename },
      {
        text: "Delete collection",
        style: "destructive",
        onPress: confirmDelete,
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function handleRename() {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Rename collection",
        `Current name: ${collection!.name}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (newName: string | undefined) => {
              if (newName?.trim() && newName.trim() !== collection!.name) {
                updateCollection({ collectionId, name: newName.trim() });
              }
            },
          },
        ],
        "plain-text",
        collection!.name,
      );
    } else {
      // Android — TODO: build a rename bottom sheet
      console.log("Rename not yet supported on Android — build rename sheet");
    }
  }

  function confirmDelete() {
    Alert.alert(
      `Delete "${collection!.name}"?`,
      `This removes the collection. The ${ideas?.length ?? 0} idea${(ideas?.length ?? 0) === 1 ? "" : "s"} inside will be kept but unassigned.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCollection({ collectionId });
            router.back();
          },
        },
      ],
    );
  }

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Hot", value: "hot" },
    { label: "Warm", value: "warm" },
    { label: "Cold", value: "cold" },
  ];

  return (
    <View className="flex-1">
      <SafeAreaView
        className="px-6 pt-3 pb-0"
        style={{ backgroundColor: Colors.primaryDark }}
      >
        {/* Nav row */}
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.accentTeal} />
            <Text className="text-base" style={{ color: Colors.accentTeal }}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOverflowMenu} activeOpacity={0.75}>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={Colors.accentTeal}
            />
          </TouchableOpacity>
        </View>

        {/* Collection name + count */}
        <View className="items-center pb-3">
          <Text
            className="text-[22px] font-semibold"
            style={{ color: Colors.textOnDark }}
          >
            {collection.name}
          </Text>
          <Text
            className="text-[13px] mt-0.5"
            style={{ color: Colors.accentTeal }}
          >
            {filteredIdeas.length}{" "}
            {filteredIdeas.length === 1 ? "idea" : "ideas"}
          </Text>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 18,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {filters.map((f) => (
            <FilterChip
              key={f.value}
              label={f.label}
              filter={f.value}
              active={activeFilter === f.value}
              onPress={() => setActiveFilter(f.value)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* ── Ideas list ── */}
      <View className="flex-1" style={{ backgroundColor: Colors.screenBg }}>
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item!._id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onPress={() =>
                router.push({
                  pathname: "/idea/[id]",
                  params: { id: item!._id },
                })
              }
            />
          )}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center pt-20 px-10 gap-2">
              <Ionicons
                name="folder-open-outline"
                size={40}
                color={Colors.cardBorder}
              />
              <Text
                className="text-[16px] font-medium"
                style={{ color: Colors.textSubtle }}
              >
                No ideas here yet
              </Text>
              <Text
                className="text-[14px] text-center leading-5"
                style={{ color: Colors.textMuted }}
              >
                Add ideas to this collection from the Idea Detail screen
              </Text>
            </View>
          }
        />
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity
        className="absolute right-5 w-[54px] h-[54px] rounded-full items-center justify-center"
        style={{
          bottom: 32,
          backgroundColor: Colors.brandTeal,
          ...Platform.select({
            ios: {
              shadowColor: Colors.brandTeal,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: { elevation: 6 },
          }),
        }}
        onPress={() => router.push("/quick-add")}
        activeOpacity={0.85}
      >
        <Text className="text-[28px] text-white font-light leading-8">+</Text>
      </TouchableOpacity>
    </View>
  );
}
