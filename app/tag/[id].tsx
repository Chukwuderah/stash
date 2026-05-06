import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Priority = "hot" | "warm" | "cold" | null;
type Status = "active" | "complete" | "archived";
type StatusFilter = "active" | "complete" | "archived";

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

// ─── Seed data (replace with Convex useQuery later) ───────────────────────────

const SEED_IDEAS_BY_TAG: Record<string, Idea[]> = {
  t3: [
    {
      id: "i1",
      text: "Write a thread on the mistake of scaling too early",
      priority: "warm",
      status: "active",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 5,
    },
    {
      id: "i2",
      text: "Lo-fi YouTube channel — study beats with a live visual timer",
      priority: "hot",
      status: "active",
      tags: [
        { id: "t3", label: "content" },
        { id: "t5", label: "creative" },
      ],
      daysOld: 8,
    },
    {
      id: "i3",
      text: "Start a newsletter about building in public",
      priority: "warm",
      status: "active",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 12,
    },
    {
      id: "i4",
      text: "Repurpose old Twitter threads into a LinkedIn carousel series",
      priority: "cold",
      status: "active",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 38,
    },
    {
      id: "i5",
      text: "YouTube Shorts strategy — repost or original?",
      priority: "cold",
      status: "active",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 45,
    },
    {
      id: "i6",
      text: "Document the Stash build process as a dev log series",
      priority: "warm",
      status: "complete",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 20,
    },
    {
      id: "i7",
      text: "Write a teardown of Notion's onboarding flow",
      priority: "cold",
      status: "archived",
      tags: [{ id: "t3", label: "content" }],
      daysOld: 60,
    },
  ],
};

// ─── Tag meta (replace with Convex lookup later) ──────────────────────────────

const TAG_META: Record<string, { label: string; color: string }> = {
  t1: { label: "apps", color: "#F97316" },
  t2: { label: "productivity", color: "#0D9488" },
  t3: { label: "content", color: "#8B5CF6" },
  t4: { label: "business", color: "#F59E0B" },
  t5: { label: "creative", color: "#EC4899" },
  t6: { label: "dev", color: "#3B82F6" },
  t7: { label: "research", color: "#10B981" },
  t8: { label: "misc", color: "#94A3B8" },
};

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
        {days}d old
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
          className="text-[14px] font-medium leading-5 mb-2.5"
          style={{ color: Colors.textPrimary }}
        >
          {idea.text}
        </Text>

        {/* Age badge on its own row if aged */}
        {isAged && (
          <View className="mb-1.5">
            <AgeBadge days={idea.daysOld} />
          </View>
        )}

        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row flex-wrap gap-1.5 flex-1">
            {idea.tags.map((tag) => (
              <TagPill key={tag.id} label={tag.label} />
            ))}
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
        style={{
          color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TagFilteredScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const tagId = id ?? "t3";
  const tag = TAG_META[tagId] ?? { label: "tag", color: Colors.brandTeal };
  const allIdeas = SEED_IDEAS_BY_TAG[tagId] ?? [];

  const filteredIdeas = allIdeas.filter((idea) => idea.status === statusFilter);

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

          {/* Sort icon */}
          <TouchableOpacity activeOpacity={0.75}>
            <Ionicons
              name="filter-outline"
              size={20}
              color={Colors.accentTeal}
            />
          </TouchableOpacity>
        </View>

        {/* Tag name + count centred */}
        <View className="items-center mb-3">
          <View className="flex-row items-center gap-2 mb-1">
            <View
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <Text
              className="text-[22px] font-semibold"
              style={{ color: Colors.textOnDark }}
            >
              #{tag.label}
            </Text>
          </View>
          <Text className="text-[13px]" style={{ color: Colors.accentTeal }}>
            {allIdeas.length} {allIdeas.length === 1 ? "idea" : "ideas"}
          </Text>
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
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              onPress={() => router.push(`/idea/${item.id}` as any)}
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
                Ideas tagged #{tag.label} with status "{statusFilter}" will
                appear here
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
