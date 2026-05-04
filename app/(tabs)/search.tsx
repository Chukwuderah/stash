import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "hot" | "warm" | "cold" | null;
type Status = "active" | "complete" | "archived";
type StatusFilter = "all" | Status;

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
  daysOld: number;
}

// ─── Seed data (replace with Convex useQuery + searchIdeas later) ─────────────

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
    daysOld: 2,
  },
  {
    id: "3",
    text: "Write a thread on the mistake of scaling too early",
    priority: "warm",
    status: "active",
    tags: [{ id: "t4", label: "content" }],
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
    daysOld: 8,
  },
  {
    id: "5",
    text: "Try Expo DOM components — is it production ready yet?",
    priority: "cold",
    status: "active",
    tags: [{ id: "t6", label: "dev" }],
    daysOld: 32,
  },
  {
    id: "6",
    text: "Build a Pomodoro timer with ambient sound packs",
    priority: "warm",
    status: "complete",
    tags: [{ id: "t1", label: "apps" }],
    daysOld: 14,
  },
  {
    id: "7",
    text: "Newsletter idea — weekly roundup of indie app launches",
    priority: "cold",
    status: "archived",
    tags: [{ id: "t4", label: "content" }],
    daysOld: 45,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_BAR: Record<NonNullable<Priority>, string> = {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  const barColor = idea.priority
    ? PRIORITY_BAR[idea.priority]
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
      <View className="flex-1 px-3.5 pt-3 pb-2.5">
        <Text
          className="text-sm font-medium leading-5 mb-2.5"
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

// ─── Status filter chip ───────────────────────────────────────────────────────

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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <View className="items-center pt-20 px-10 gap-3">
      <Ionicons name="search-outline" size={40} color={Colors.cardBorder} />
      {query.length > 0 ? (
        <>
          <Text
            className="text-base font-medium"
            style={{ color: Colors.textSubtle }}
          >
            No ideas found
          </Text>
          <Text
            className="text-sm text-center leading-5"
            style={{ color: Colors.textMuted }}
          >
            Nothing matched "{query}" — try a different search
          </Text>
        </>
      ) : (
        <Text
          className="text-sm text-center leading-5"
          style={{ color: Colors.textMuted }}
        >
          Start typing to search your stash
        </Text>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Client-side filter (replace with Convex searchIdeas query later)
  const results = useMemo(() => {
    return SEED_IDEAS.filter((idea) => {
      const matchesQuery =
        query.trim() === "" ||
        idea.text.toLowerCase().includes(query.toLowerCase()) ||
        idea.tags.some((t) =>
          t.label.toLowerCase().includes(query.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "all" || idea.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  return (
    <View className="flex-1">
      <SafeAreaView style={{ backgroundColor: Colors.primaryDark }}>
        {/* ── Header ── */}
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onPress={() => router.push(`/idea/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={<EmptyState query={query} />}
        />
      </View>
    </View>
  );
}
