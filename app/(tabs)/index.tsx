import Colors from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Priority = "hot" | "warm" | "cold" | null;
type Status = "active" | "archived" | "complete";
type Filter = "all" | "hot" | "warm" | "cold";

interface Tag {
  id: string;
  label: string;
}

interface Idea {
  id: string;
  text: string;
  priority: Priority;
  status: Status;
  tags: Tag[];
  createdAt: Date;
  daysOld: number;
}

// ─── Seed data (replace with Convex useQuery later) ───────────────────────────

const SEED_IDEAS: Idea[] = [
  {
    id: "1",
    text: "Build a habit tracker app — 15 min daily sessions only",
    priority: "hot",
    status: "active",
    tags: [
      { id: "t1", label: "apps" },
      { id: "t2", label: "productivity" },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    daysOld: 1,
  },
  {
    id: "2",
    text: "Freelance rate calculator for designers — what's the real MVP?",
    priority: "hot",
    status: "active",
    tags: [
      { id: "t3", label: "business" },
      { id: "t1", label: "apps" },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    daysOld: 2,
  },
  {
    id: "3",
    text: "Write a thread on the mistake of scaling too early",
    priority: "warm",
    status: "active",
    tags: [{ id: "t4", label: "content" }],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    daysOld: 5,
  },
  {
    id: "4",
    text: "Lo-fi YouTube channel — study beats with a live visual timer",
    priority: "warm",
    status: "active",
    tags: [
      { id: "t4", label: "content" },
      { id: "t5", label: "creative" },
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    daysOld: 8,
  },
  {
    id: "5",
    text: "Try Expo DOM components — is it production ready yet?",
    priority: "cold",
    status: "active",
    tags: [{ id: "t6", label: "dev" }],
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
    daysOld: 32,
  },
];

const PRIORITY_BAR_COLOR: Record<NonNullable<Priority>, string> = {
  hot: Colors.hot,
  warm: Colors.warm,
  cold: Colors.cold,
};

const AGE_THRESHOLD_DAYS = 30;

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

function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  const barColor = idea.priority
    ? PRIORITY_BAR_COLOR[idea.priority]
    : Colors.cardBorder;
  const isAged = idea.daysOld >= AGE_THRESHOLD_DAYS;

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
            {idea.tags.map((tag) => (
              <TagPill key={tag.id} label={tag.label} />
            ))}
            {isAged && <AgeBadge days={idea.daysOld} />}
          </View>
          <Text
            className="text-[11px] flex-shrink-0"
            style={{ color: Colors.textMuted }}
          >
            {formatRelativeTime(idea.daysOld)}
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

export default function index() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filteredIdeas = SEED_IDEAS.filter((idea) => {
    if (activeFilter === "all") return true;
    return idea.priority === activeFilter;
  });

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Hot", value: "hot" },
    { label: "Warm", value: "warm" },
    { label: "Cold", value: "cold" },
  ];

  return (
    <View className="flex-1">
      <SafeAreaView
        style={{ backgroundColor: Colors.primaryDark }}
        className="px-6 pt-6 pb-3"
      >
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="text-white text-4xl font-extrabold">Stash</Text>
            <Text
              style={{ color: Colors.textOnDark }}
              className="text-lg font-medium"
            >
              {SEED_IDEAS.length} ideas parked
            </Text>
          </View>
          <View
            className="rounded-full w-10 h-10 flex flex-row items-center justify-center"
            style={{ backgroundColor: Colors.brandTeal }}
          >
            <Text className="text-white text-2xl font-medium">A</Text>
          </View>
        </View>

        {/* ── Filter chips ── */}
        <View
          className="mt-4 mb-2.5"
          style={{ backgroundColor: Colors.primaryDark }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 14,
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
        </View>
      </SafeAreaView>

      {/* ── Idea list ── */}
      <View className="flex-1" style={{ backgroundColor: Colors.screenBg }}>
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onPress={() => router.push(`/idea/${item.id}`)}
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
