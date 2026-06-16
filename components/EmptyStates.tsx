import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

// ─── The Lot — no ideas yet ───────────────────────────────────────────────────

export function EmptyLot() {
  const router = useRouter();
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: Colors.lightTeal }}
      >
        <Ionicons name="archive-outline" size={32} color={Colors.brandTeal} />
      </View>
      <Text
        className="text-[20px] font-semibold text-center"
        style={{ color: Colors.textSubtle }}
      >
        Your stash is empty
      </Text>
      <Text
        className="text-[16px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Ideas you capture will live here. Tap the + button to park your first
        one.
      </Text>
      <TouchableOpacity
        className="mt-3 px-6 py-3 rounded-xl"
        style={{ backgroundColor: Colors.brandTeal }}
        onPress={() => router.push("/quick-add")}
        activeOpacity={0.85}
      >
        <Text className="text-[14px] font-semibold text-white">
          Stash an idea
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── The Lot — filter active but no results ───────────────────────────────────

export function EmptyFilteredLot({ filter }: { filter: string }) {
  return (
    <View className="items-center pt-24 px-10 gap-2">
      <Ionicons name="filter-outline" size={36} color={Colors.cardBorder} />
      <Text
        className="text-[16px] font-medium text-center mt-2"
        style={{ color: Colors.textSubtle }}
      >
        No {filter} ideas
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        You don't have any ideas marked as {filter} priority yet.
      </Text>
    </View>
  );
}

// ─── Search — before typing ───────────────────────────────────────────────────

export function EmptySearchPrompt() {
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <Ionicons name="search-outline" size={40} color={Colors.cardBorder} />
      <Text
        className="text-[16px] font-medium text-center"
        style={{ color: Colors.textSubtle }}
      >
        Search your stash
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Type to search by idea text or tag name.
      </Text>
    </View>
  );
}

// ─── Search — no results ──────────────────────────────────────────────────────

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <Ionicons name="search-outline" size={40} color={Colors.cardBorder} />
      <Text
        className="text-[16px] font-medium text-center"
        style={{ color: Colors.textSubtle }}
      >
        No ideas found
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Nothing in your stash matched &quot;{query}&quot;. Try different
        keywords.
      </Text>
    </View>
  );
}

// ─── Tags tab — no tags yet ───────────────────────────────────────────────────

export function EmptyTags() {
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: Colors.lightTeal }}
      >
        <Ionicons name="pricetag-outline" size={32} color={Colors.brandTeal} />
      </View>
      <Text
        className="text-[18px] font-semibold text-center"
        style={{ color: Colors.textSubtle }}
      >
        No tags yet
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Tags help you organise your ideas. Create one above or add tags while
        capturing ideas.
      </Text>
    </View>
  );
}

// ─── Tag filtered list — no ideas for this status ────────────────────────────

export function EmptyTagIdeas({
  tagName,
  status,
}: {
  tagName: string;
  status: string;
}) {
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <Ionicons name="pricetag-outline" size={40} color={Colors.cardBorder} />
      <Text
        className="text-[16px] font-medium text-center"
        style={{ color: Colors.textSubtle }}
      >
        No {status} ideas
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Ideas tagged #{tagName} with status &quot;{status}&quot; will appear here.
      </Text>
    </View>
  );
}

// ─── Collection — no ideas yet ────────────────────────────────────────────────

export function EmptyCollection() {
  const router = useRouter();
  return (
    <View className="items-center pt-24 px-10 gap-3">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: Colors.lightTeal }}
      >
        <Ionicons
          name="folder-open-outline"
          size={32}
          color={Colors.brandTeal}
        />
      </View>
      <Text
        className="text-[18px] font-semibold text-center"
        style={{ color: Colors.textSubtle }}
      >
        Collection is empty
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        Assign ideas to this collection from the Idea Detail screen, or stash a
        new one.
      </Text>
      <TouchableOpacity
        className="mt-3 px-6 py-3 rounded-full"
        style={{ backgroundColor: Colors.brandTeal }}
        onPress={() => router.push("/quick-add")}
        activeOpacity={0.85}
      >
        <Text className="text-[14px] font-semibold text-white">
          Stash an idea
        </Text>
      </TouchableOpacity>
    </View>
  );
}
