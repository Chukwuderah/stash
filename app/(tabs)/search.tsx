import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import { EmptySearchPrompt, EmptySearchResults } from "@/shared/EmptyStates";
import { Ionicons } from "@expo/vector-icons";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types

type Priority = "hot" | "warm" | "cold" | null;
type StatusFilter = "all" | "active" | "complete" | "archived";

// Helpers

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
        {days}D OLD
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
          className="text-sm font-medium leading-5 mb-2.5"
          style={{ color: Colors.textPrimary }}
        >
          {idea.text}
        </Text>
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap gap-1.5 flex-1">
            {idea.tags?.map((tag: any) => (
              <TagPill key={tag._id} label={tag.name} />
            ))}
            {isAged && <AgeBadge days={daysOld} />}
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

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Complete", value: "complete" },
  { label: "Archived", value: "archived" },
];

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
      className="px-4 py-2 rounded-full border"
      style={{
        backgroundColor: Colors.screenBg,
        borderColor: active ? Colors.brandTeal : Colors.cardBorder,
        borderWidth: active ? 1.5 : 0.5,
      }}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text
        className="text-[13px] font-medium"
        style={{ color: active ? Colors.brandTeal : Colors.textMuted }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Main screen

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { isAuthenticated } = useConvexAuth();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  //  ── Debounce: only fires Convex query when user pauses typing (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useQuery(
    api.ideas.searchIdeas,
    !isAuthenticated ? "skip" : { query: debouncedQuery },
  );

  //  ── Client-side status filter on search results
  const results = useMemo(() => {
    if (!searchResults) return [];
    if (statusFilter === "all") return searchResults;
    return searchResults.filter((idea) => idea?.status === statusFilter);
  }, [searchResults, statusFilter]);

  //  Show spinner inside input when a search is actively loading
  const isSearching =
    debouncedQuery.trim().length > 0 && searchResults === undefined;

  return (
    <View className="flex-1">
      <SafeAreaView style={{ backgroundColor: Colors.primaryDark }}>
        <View
          className="px-5 pt-4 pb-3"
          style={{ backgroundColor: Colors.primaryDark }}
        >
          <Text
            className="text-[29px] font-semibold tracking-tight mb-3"
            style={{ color: Colors.textOnDark }}
          >
            Search
          </Text>

          {/* Search input */}
          <View
            className="flex-row items-center gap-2 rounded-xl px-4 py-2"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={Colors.accentTeal}
            />
            <TextInput
              className="flex-1 text-base"
              style={{ color: Colors.textOnDark }}
              placeholder="Search your stash..."
              placeholderTextColor={Colors.accentTeal}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={Colors.accentTeal} />
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* ── Status filter chips ── */}
      <View style={{ backgroundColor: Colors.screenBg }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {STATUS_FILTERS.map((f) => (
            <StatusChip
              key={f.value}
              label={f.label}
              active={statusFilter === f.value}
              onPress={() => setStatusFilter(f.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Results ── */}
      <View className="flex-1" style={{ backgroundColor: Colors.screenBg }}>
        <FlatList
          data={results}
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
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={() =>
            query.trim().length === 0 ? (
              <EmptySearchPrompt />
            ) : (
              <EmptySearchResults query={query} />
            )
          }
        />
      </View>
    </View>
  );
}
