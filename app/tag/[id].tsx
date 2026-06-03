import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types

type Priority = "hot" | "warm" | "cold" | null;
type StatusFilter = "active" | "complete" | "archived";

// Helpers──

const PRIORITY_BAR: Record<NonNullable<Priority>, string> = {
  hot: Colors.hot,
  warm: Colors.warm,
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

// Sub-components

function TagPill({ label }: { label: string }) {
  return (
    <View
      className="rounded-[10px] px-2 py-0.5"
      style={{ backgroundColor: Colors.lightTeal }}
    >
      <Text
        className="text-[11px] font-medium"
        style={{ color: Colors.textSubtle }}
      >
        {label.toUpperCase()}
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
        className="text-[11px] font-medium"
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
        <Text
          className="text-[14px] font-medium leading-5 mb-2.5"
          style={{ color: Colors.textPrimary }}
        >
          {idea.text}
        </Text>
        {isAged && (
          <View className="mb-1.5">
            <AgeBadge days={daysOld} />
          </View>
        )}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap gap-1.5 flex-1">
            {idea.tags?.map((tag: any) => (
              <TagPill key={tag._id} label={tag.name} />
            ))}
          </View>
          <Text
            className="text-[11px] flex-shrink-0"
            style={{ color: Colors.textMuted }}
          >
            {formatRelativeTime(daysOld)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StatusChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="px-5 py-2 rounded-full border"
      style={{
        backgroundColor: active ? Colors.brandTeal : "transparent",
        borderColor: active ? Colors.brandTeal : "rgba(255,255,255,0.3)",
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        className="text-[13px] font-medium"
        style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Main screen

export default function TagFilteredScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tagId = id as Id<"tags">;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  // ── Convex
  const tag = useQuery(
    api.tags.getTagById,
    !isLoaded || !isSignedIn ? "skip" : { tagId },
  );
  const allIdeas = useQuery(
    api.ideas.getIdeasByTag,
    !isLoaded || !isSignedIn ? "skip" : { tagId },
  );

  const isLoading = tag === undefined || allIdeas === undefined;

  // Client-side status filter
  const filteredIdeas =
    allIdeas?.filter((idea) => idea?.status === statusFilter) ?? [];

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "Active", value: "active" },
    { label: "Complete", value: "complete" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.primaryDark }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />

      {/* ── Header ── */}
      <View
        className="px-5 pt-3 pb-0"
        style={{ backgroundColor: Colors.primaryDark }}
      >
        {/* Nav row */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.accentTeal} />
            <Text className="text-[14px]" style={{ color: Colors.accentTeal }}>
              Tags
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.75}>
            <Ionicons
              name="filter-outline"
              size={20}
              color={Colors.accentTeal}
            />
          </TouchableOpacity>
        </View>

        {/* Tag name + count */}
        <View className="items-center mb-3">
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.accentTeal} />
          ) : (
            <>
              <View className="flex-row items-center gap-2 mb-1">
                <View
                  className="w-[10px] h-[10px] rounded-full"
                  style={{ backgroundColor: tag?.color ?? Colors.brandTeal }}
                />
                <Text
                  className="text-[22px] font-semibold"
                  style={{ color: Colors.textOnDark }}
                >
                  #{tag?.name ?? ""}
                </Text>
              </View>
              <Text
                className="text-[13px]"
                style={{ color: Colors.accentTeal }}
              >
                {allIdeas?.length ?? 0}{" "}
                {(allIdeas?.length ?? 0) === 1 ? "idea" : "ideas"}
              </Text>
            </>
          )}
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 16,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {statusFilters.map((f) => (
            <StatusChip
              key={f.value}
              label={f.label}
              active={statusFilter === f.value}
              onPress={() => setStatusFilter(f.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Ideas list ── */}
      <View className="flex-1" style={{ backgroundColor: Colors.screenBg }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.brandTeal} />
          </View>
        ) : (
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
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center pt-20 px-10 gap-3">
                <Ionicons
                  name="pricetag-outline"
                  size={40}
                  color={Colors.cardBorder}
                />
                <Text
                  className="text-[16px] font-medium"
                  style={{ color: Colors.textSubtle }}
                >
                  No {statusFilter} ideas
                </Text>
                <Text
                  className="text-[14px] text-center leading-5"
                  style={{ color: Colors.textMuted }}
                >
                  Ideas tagged #{tag?.name} with status &quot;{statusFilter}
                  &quot; will appear here
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
