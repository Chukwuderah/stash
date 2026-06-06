import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "hot" | "warm" | "cold" | null;
type Filter = "all" | "hot" | "warm" | "cold";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_BAR_COLOR: Record<NonNullable<Priority>, string> = {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    ? PRIORITY_BAR_COLOR[idea.priority as NonNullable<Priority>]
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

      <View className="flex-1 p-3.5">
        <Text
          className="text-base font-medium leading-5 mb-2.5"
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

const FILTER_DOT: Record<Exclude<Filter, "all">, string> = {
  hot: Colors.hot,
  warm: Colors.accentTeal,
  cold: Colors.cold,
};

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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TheLotScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const { isAuthenticated } = useConvexAuth();

  const { user } = useUser();
  const initial = user?.firstName?.[0]?.toUpperCase() ?? "?";

  // ── Convex query ──────────────────────────────────────────────────────────
  // undefined = loading, array = ready
  const ideas = useQuery(api.ideas.getIdeas, !isAuthenticated ? "skip" : {});

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Hot", value: "hot" },
    { label: "Warm", value: "warm" },
    { label: "Cold", value: "cold" },
  ];

  // Client-side priority filter
  const filteredIdeas =
    ideas?.filter((idea) => {
      if (activeFilter === "all") return true;
      return idea.priority === activeFilter;
    }) ?? [];

  return (
    <View className="flex-1">
      <SafeAreaView
        style={{ backgroundColor: Colors.primaryDark }}
        className="px-6 pt-6 pb-3"
      >
        {/* ── Header ── */}
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="text-white text-4xl font-extrabold">Stash</Text>
            <Text
              style={{ color: Colors.accentTeal }}
              className="text-lg font-medium"
            >
              {ideas?.length ?? 0} idea{(ideas?.length ?? 0) !== 1 ? "s" : ""}{" "}
              parked
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            activeOpacity={0.8}
            className="rounded-full w-10 h-10 items-center justify-center"
            style={{ backgroundColor: Colors.brandTeal }}
          >
            <Text className="text-white text-base font-semibold">
              {initial}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Filter chips ── */}
        <View className="mt-4 mb-2.5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, flexDirection: "row" }}
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
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <View className="flex-1" style={{ backgroundColor: Colors.screenBg }}>
        {/* Loading */}
        {ideas === undefined && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.brandTeal} />
          </View>
        )}

        {/* Loaded */}
        {ideas !== undefined && (
          <FlatList
            data={filteredIdeas}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <IdeaCard
                idea={item}
                onPress={() =>
                  router.push({
                    pathname: "/idea/[id]",
                    params: { id: item._id },
                  })
                }
              />
            )}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center pt-20 px-10 gap-2">
                <Text
                  className="text-[16px] font-medium"
                  style={{ color: Colors.textSubtle }}
                >
                  Nothing parked yet
                </Text>
                <Text
                  className="text-[14px] text-center leading-5"
                  style={{ color: Colors.textMuted }}
                >
                  Tap the + button to stash your first idea
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity
        className="absolute right-5 w-[54px] h-[54px] rounded-full items-center justify-center"
        style={{
          bottom: 140,
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
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
