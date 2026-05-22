import Colors from "@/constants/colors";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUserId } from "@/hooks/useUserId";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types

type Priority = "hot" | "warm" | "cold" | null;
type Status = "active" | "complete" | "archived";

// Helpers

const PRIORITY_BAR: Record<NonNullable<Priority>, string> = {
  hot: Colors.hot,
  warm: Colors.warm,
  cold: Colors.cold,
};

const PRIORITY_DOT: Record<NonNullable<Priority>, string> = {
  hot: Colors.hot,
  warm: "#FFFFFF",
  cold: Colors.cold,
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNoteDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysOld(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

// Sub-components

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-[11px] font-semibold tracking-widest uppercase mb-3"
      style={{ color: Colors.brandTeal }}
    >
      {label}
    </Text>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl p-4 mb-3 border-[0.5px]"
      style={{ backgroundColor: Colors.cardBg, borderColor: Colors.cardBorder }}
    >
      {children}
    </View>
  );
}

// Main screen

export default function IdeaDetailScreen() {
  const router = useRouter();
  const userId = useUserId();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ideaId = id as Id<"ideas">;

  const [newNote, setNewNote] = useState("");

  // Convex
  const idea = useQuery(api.ideas.getIdeaById, { ideaId });
  const updateIdea = useMutation(api.ideas.updateIdea);
  const addNote = useMutation(api.notes.addNote);

  // Loading
  if (idea === undefined) {
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
  if (idea === null) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.screenBg }}
      >
        <Text style={{ color: Colors.textMuted }}>Idea not found.</Text>
      </View>
    );
  }

  const daysOld = getDaysOld(idea.createdAt);
  const barColor = idea.priority
    ? PRIORITY_BAR[idea.priority as NonNullable<Priority>]
    : Colors.cardBorder;

  // Handlers

  function handleSetStatus(status: Status) {
    updateIdea({ ideaId, status });
  }

  function handleSetPriority(priority: NonNullable<Priority>) {
    updateIdea({ ideaId, priority });
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    await addNote({ ideaId, text: newNote.trim(), userId });
    setNewNote("");
  }

  function confirmArchive() {
    Alert.alert(
      "Archive this idea?",
      "It'll be removed from your feed but you can still find it later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            await updateIdea({ ideaId, status: "archived" });
            router.back();
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <SafeAreaView
        className="flex-row items-center justify-between px-5 pt-3 pb-0"
        style={{ backgroundColor: Colors.primaryDark }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1"
        >
          <Ionicons name="chevron-back" size={20} color={Colors.accentTeal} />
          <Text className="text-[15px]" style={{ color: Colors.accentTeal }}>
            Back
          </Text>
        </TouchableOpacity>

        <Text
          className="text-[16px] font-semibold"
          style={{ color: Colors.textOnDark }}
        >
          Idea Details
        </Text>

        <TouchableOpacity>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={Colors.accentTeal}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Scrollable body */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        style={{ backgroundColor: Colors.screenBg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Idea text card */}
        <SectionCard>
          <View className="flex-row gap-3">
            <View
              className="w-1 rounded-full flex-shrink-0 self-stretch"
              style={{ backgroundColor: barColor, minHeight: 56 }}
            />
            <Text
              className="text-[16px] font-medium leading-6 flex-1"
              style={{ color: Colors.textPrimary }}
            >
              {idea.text}
            </Text>
          </View>

          <View
            className="flex-row justify-between items-center mt-3 pt-3 border-t-[0.5px]"
            style={{ borderColor: Colors.cardBorder }}
          >
            <Text className="text-[12px]" style={{ color: Colors.textMuted }}>
              Added {formatDate(idea.createdAt)}
            </Text>
            {daysOld >= 1 && (
              <View
                className="rounded-[10px] px-2 py-0.5"
                style={{ backgroundColor: Colors.ageBadgeBg }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{ color: Colors.ageBadgeText }}
                >
                  {daysOld} DAYS OLD
                </Text>
              </View>
            )}
          </View>
        </SectionCard>

        {/* Status */}
        <SectionCard>
          <SectionLabel label="Status" />
          <View className="flex-row gap-2">
            {(["active", "complete", "archived"] as Status[]).map((s) => {
              const active = idea.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  className="flex-1 py-2.5 rounded-lg items-center border-[0.5px]"
                  style={{
                    backgroundColor: active ? Colors.brandTeal : Colors.cardBg,
                    borderColor: active ? Colors.brandTeal : Colors.cardBorder,
                  }}
                  onPress={() => handleSetStatus(s)}
                  activeOpacity={0.75}
                >
                  <Text
                    className="text-[13px] font-medium"
                    style={{ color: active ? "#FFFFFF" : Colors.textSubtle }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Priority */}
        <SectionCard>
          <SectionLabel label="Priority" />
          <View className="flex-row gap-2">
            {(["hot", "warm", "cold"] as NonNullable<Priority>[]).map((p) => {
              const active = idea.priority === p;
              const dotColor = active ? PRIORITY_DOT[p] : PRIORITY_BAR[p];

              const activeBg: Record<string, string> = {
                hot: "#FFF7ED",
                warm: Colors.brandTeal,
                cold: "#F8FAFC",
              };
              const activeText: Record<string, string> = {
                hot: "#C2410C",
                warm: "#FFFFFF",
                cold: "#64748B",
              };
              const activeBorder: Record<string, string> = {
                hot: "#FED7AA",
                warm: Colors.brandTeal,
                cold: "#CBD5E1",
              };

              return (
                <TouchableOpacity
                  key={p}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-full border-[0.5px]"
                  style={{
                    backgroundColor: active ? activeBg[p] : Colors.cardBg,
                    borderColor: active ? activeBorder[p] : Colors.cardBorder,
                  }}
                  onPress={() => handleSetPriority(p)}
                  activeOpacity={0.75}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: active ? dotColor : PRIORITY_BAR[p],
                    }}
                  />
                  <Text
                    className="text-[13px] font-medium capitalize"
                    style={{ color: active ? activeText[p] : Colors.textMuted }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SectionCard>

        {/* Tags */}
        <SectionCard>
          <SectionLabel label="Tags" />
          <View className="flex-row flex-wrap gap-2 items-center">
            {idea.tags.map((tag: any) => (
              <View
                key={tag._id}
                className="rounded-[10px] px-3 py-1"
                style={{ backgroundColor: Colors.lightTeal }}
              >
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: Colors.textSubtle }}
                >
                  {tag.name}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/tag-picker",
                  params: {
                    ideaId: idea._id,
                    selected: JSON.stringify(idea.tags.map((t: any) => t._id)),
                  },
                })
              }
              className="flex-row items-center gap-1 rounded-[10px] px-3 py-1 border border-dashed"
              style={{ borderColor: Colors.brandTeal }}
            >
              <Text
                className="text-[13px] font-medium"
                style={{ color: Colors.brandTeal }}
              >
                + Add tag
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Collection */}
        {idea.collection && (
          <SectionCard>
            <TouchableOpacity
              onPress={() => {
                if (!idea.collectionId) return;
                router.push({
                  pathname: "/collection/[id]",
                  params: { id: idea.collectionId },
                });
              }}
              className="flex-row items-center gap-3"
            >
              <Ionicons
                name="folder-outline"
                size={22}
                color={Colors.textMuted}
              />
              <Text
                className="flex-1 text-[15px] font-medium"
                style={{ color: Colors.textPrimary }}
              >
                {idea.collection.name}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.brandTeal}
              />
            </TouchableOpacity>
          </SectionCard>
        )}

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/collection/[id]",
              params: {
                id: idea.collectionId || "", // Pass empty string if no collectionId to avoid undefined
              },
            })
          }
          className="flex-row items-center gap-1 rounded-[10px] px-3 py-1 border border-dashed"
          style={{ borderColor: Colors.brandTeal }}
        >
          <Text
            className="text-[13px] text-center font-medium"
            style={{ color: Colors.brandTeal }}
          >
            Collection
          </Text>
        </TouchableOpacity>

        {/* Notes */}
        <SectionCard>
          <View className="flex-row justify-between items-center mb-3">
            <SectionLabel label="Notes" />
            <Text
              className="text-[12px] -mt-3"
              style={{ color: Colors.accentTeal }}
            >
              {idea.notes.length} {idea.notes.length === 1 ? "note" : "notes"}
            </Text>
          </View>

          {idea.notes.map((note: any, index: number) => (
            <View key={note._id}>
              {index > 0 && (
                <View
                  className="h-[0.5px] my-3"
                  style={{ backgroundColor: Colors.cardBorder }}
                />
              )}
              <Text
                className="text-[14px] leading-5 mb-1"
                style={{ color: Colors.textPrimary }}
              >
                {note.text}
              </Text>
              <Text className="text-[12px]" style={{ color: Colors.textMuted }}>
                {formatNoteDate(note.createdAt)}
              </Text>
            </View>
          ))}

          {/* Add note input */}
          <View
            className="flex-row items-center gap-2 mt-4 p-3 rounded-lg border border-dashed"
            style={{
              borderColor: Colors.accentTeal,
              backgroundColor: Colors.screenBg,
            }}
          >
            <Ionicons
              name="pencil-outline"
              size={16}
              color={Colors.textMuted}
            />
            <TextInput
              className="flex-1 text-[14px]"
              style={{ color: Colors.textPrimary }}
              placeholder="Add a note..."
              placeholderTextColor={Colors.textMuted}
              value={newNote}
              onChangeText={setNewNote}
              onSubmitEditing={handleAddNote}
              returnKeyType="done"
              multiline={false}
            />
          </View>
        </SectionCard>

        {/* Archive */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 mt-2"
          onPress={confirmArchive}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.destructive} />
          <Text
            className="text-[14px] font-medium"
            style={{ color: Colors.destructive }}
          >
            Archive this idea
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
