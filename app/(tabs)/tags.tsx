import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types

interface TagWithCount {
  _id: Id<"tags">;
  name: string;
  color: string;
  ideaCount: number;
}

// Tag row──

function TagRow({
  tag,
  onPress,
  onLongPress,
}: {
  tag: TagWithCount;
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
      <View
        className="w-[10px] h-[10px] rounded-full mr-3"
        style={{ backgroundColor: tag.color }}
      />
      <Text
        className="flex-1 text-[15px] font-medium"
        style={{ color: Colors.textPrimary }}
      >
        {tag.name}
      </Text>
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
      <Ionicons name="chevron-forward" size={16} color={Colors.brandTeal} />
    </TouchableOpacity>
  );
}

// Main screen

export default function TagsScreen() {
  const router = useRouter();

  // ── Convex
  const tags = useQuery(api.tags.getTags, {});
  const deleteTag = useMutation(api.tags.deleteTag);
  const updateTag = useMutation(api.tags.updateTag);

  // ── Handlers

  function handleTagPress(tag: TagWithCount) {
    router.push({
      pathname: "/tag/[id]",
      params: { id: tag._id },
    });
  }

  function handleTagLongPress(tag: TagWithCount) {
    Alert.alert(tag.name, "What do you want to do with this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Rename",
        onPress: () => handleRenameTag(tag),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDeleteTag(tag),
      },
    ]);
  }

  function handleRenameTag(tag: TagWithCount) {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Rename tag",
        `Current name: ${tag.name}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: (newName?: string) => {
              if (newName?.trim() && newName.trim() !== tag.name) {
                updateTag({ tagId: tag._id, name: newName.trim() });
              }
            },
          },
        ],
        "plain-text",
        tag.name,
      );
    } else {
      // Android — TODO: build a rename bottom sheet
      // For now, route to tag picker which has inline creation
      console.log("Rename not yet supported on Android — build rename sheet");
    }
  }

  function confirmDeleteTag(tag: TagWithCount) {
    Alert.alert(
      `Delete "${tag.name}"?`,
      `This will remove the tag from all ${tag.ideaCount} ${tag.ideaCount === 1 ? "idea" : "ideas"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTag({ tagId: tag._id }),
        },
      ],
    );
  }

  function handleNewTag() {
    // Tag Picker has inline tag creation built in — route there
    router.push({
      pathname: "/tag-picker",
      params: { selected: JSON.stringify([]) },
    });
  }

  return (
    <View className="flex-1">
      <SafeAreaView style={{ backgroundColor: Colors.primaryDark }}>
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
            {tags?.length ?? 0} {(tags?.length ?? 0) === 1 ? "tag" : "tags"}
          </Text>
        </View>
      </SafeAreaView>

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

        {/* Loading */}
        {tags === undefined && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.brandTeal} />
          </View>
        )}

        {/* Tag list */}
        {tags !== undefined && (
          <FlatList
            data={tags}
            keyExtractor={(item) => item._id}
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
                  Tap "New tag" or add tags while creating an idea
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
