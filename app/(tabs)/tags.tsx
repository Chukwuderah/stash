import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string;
  label: string;
  color: string;
  ideaCount: number;
}

// ─── Seed data (replace with Convex useQuery later) ───────────────────────────

const SEED_TAGS: Tag[] = [
  { id: "t1", label: "apps", color: "#F97316", ideaCount: 5 },
  { id: "t2", label: "productivity", color: "#0D9488", ideaCount: 4 },
  { id: "t3", label: "content", color: "#8B5CF6", ideaCount: 7 },
  { id: "t4", label: "business", color: "#F59E0B", ideaCount: 3 },
  { id: "t5", label: "creative", color: "#EC4899", ideaCount: 6 },
  { id: "t6", label: "dev", color: "#3B82F6", ideaCount: 4 },
  { id: "t7", label: "research", color: "#10B981", ideaCount: 2 },
  { id: "t8", label: "misc", color: "#94A3B8", ideaCount: 1 },
];

// ─── Tag row ─────────────────────────────────────────────────────────────────

function TagRow({
  tag,
  onPress,
  onLongPress,
}: {
  tag: Tag;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-[18px] rounded-xl mb-2.5 border-[0.5px]"
      style={{ backgroundColor: Colors.cardBg, borderColor: Colors.cardBorder }}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.72}
    >
      {/* Colour dot */}
      <View
        className="w-[10px] h-[10px] rounded-full mr-3"
        style={{ backgroundColor: tag.color }}
      />

      {/* Tag name */}
      <Text
        className="flex-1 text-[15px] font-medium"
        style={{ color: Colors.textPrimary }}
      >
        {tag.label}
      </Text>

      {/* Count badge */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: Colors.lightTeal }}
      >
        <Text
          className="text-[13px] font-semibold"
          style={{ color: Colors.textSubtle }}
        >
          {tag.ideaCount}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color={Colors.brandTeal} />
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TagsScreen() {
  const router = useRouter();

  function handleTagPress(tag: Tag) {
    // Navigate to filtered list for this tag
    // router.push(`/tag/${tag.id}`);
  }

  function handleTagLongPress(tag: Tag) {
    Alert.alert(tag.label, "What do you want to do with this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Rename",
        onPress: () => {
          // TODO: open rename sheet
          console.log("Rename tag:", tag.id);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // TODO: Convex deleteTag mutation
          console.log("Delete tag:", tag.id);
        },
      },
    ]);
  }

  function handleNewTag() {
    // TODO: open new tag sheet
    console.log("New tag");
  }

  const totalIdeas = SEED_TAGS.reduce((sum, t) => sum + t.ideaCount, 0);

  return (
    <View className="flex-1">
      <SafeAreaView style={{ backgroundColor: Colors.primaryDark }}>
        {/* ── Header ── */}
        <View
          className="px-5 pt-4 pb-5"
          style={{ backgroundColor: Colors.primaryDark }}
        >
          <Text
            className="text-[29px] font-semibold tracking-tight"
            style={{ color: Colors.textOnDark }}
          >
            Tags
          </Text>
          <Text
            className="text-[13px] mt-0.5"
            style={{ color: Colors.accentTeal }}
          >
            {SEED_TAGS.length} tags
          </Text>
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <View
        className="flex-1 px-4 pt-4"
        style={{ backgroundColor: Colors.screenBg }}
      >
        {/* New tag button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 rounded-xl mb-4 border border-dashed"
          style={{
            borderColor: Colors.brandTeal,
            backgroundColor: Colors.cardBg,
          }}
          onPress={handleNewTag}
          activeOpacity={0.75}
        >
          <Text
            className="text-[20px] leading-5"
            style={{ color: Colors.brandTeal }}
          >
            +
          </Text>
          <Text
            className="text-[15px] font-medium"
            style={{ color: Colors.brandTeal }}
          >
            New tag
          </Text>
        </TouchableOpacity>

        {/* Tag list */}
        <FlatList
          data={SEED_TAGS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TagRow
              tag={item}
              onPress={() => handleTagPress(item)}
              onLongPress={() => handleTagLongPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-3">
              <Ionicons
                name="pricetag-outline"
                size={40}
                color={Colors.cardBorder}
              />
              <Text
                className="text-[16px] font-medium"
                style={{ color: Colors.textSubtle }}
              >
                No tags yet
              </Text>
              <Text
                className="text-[14px] text-center leading-5 px-10"
                style={{ color: Colors.textMuted }}
              >
                Create a tag to start organising your ideas
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
