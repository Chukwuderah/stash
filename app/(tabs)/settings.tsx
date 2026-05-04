import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Cadence = "Daily" | "Every 2 days" | "Weekly";
type AgingThreshold = "30 days" | "60 days" | "90 days";
type SortOrder = "Newest first" | "Oldest first";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl mb-3 overflow-hidden border-[0.5px]"
      style={{ backgroundColor: Colors.cardBg, borderColor: Colors.cardBorder }}
    >
      {children}
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-lg font-semibold tracking-widest uppercase px-4 pt-4 pb-3"
      style={{ color: Colors.brandTeal }}
    >
      {label}
    </Text>
  );
}

function Divider() {
  return (
    <View
      className="h-[0.5px] mx-4"
      style={{ backgroundColor: Colors.cardBorder }}
    />
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  showChevron = true,
  valueColor,
  icon,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  valueColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4"
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      disabled={!onPress}
    >
      <Text
        className="text-base font-medium"
        style={{ color: Colors.textPrimary }}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-1">
        {icon}
        {value && (
          <Text
            className="text-sm"
            style={{ color: valueColor ?? Colors.brandTeal }}
          >
            {value}
          </Text>
        )}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.cardBorder}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  // Local state (replace with Convex user prefs later)
  const [dailyNudge, setDailyNudge] = useState(true);
  const [cadence, setCadence] = useState<Cadence>("Daily");
  const [agingThreshold, setAgingThreshold] =
    useState<AgingThreshold>("30 days");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Newest first");

  // Pickers
  function pickCadence() {
    Alert.alert("Cadence", "How often should we resurface an old idea?", [
      { text: "Daily", onPress: () => setCadence("Daily") },
      { text: "Every 2 days", onPress: () => setCadence("Every 2 days") },
      { text: "Weekly", onPress: () => setCadence("Weekly") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function pickAgingThreshold() {
    Alert.alert(
      "Age badge after",
      "Show the age badge when an idea is older than:",
      [
        { text: "30 days", onPress: () => setAgingThreshold("30 days") },
        { text: "60 days", onPress: () => setAgingThreshold("60 days") },
        { text: "90 days", onPress: () => setAgingThreshold("90 days") },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  function pickSortOrder() {
    Alert.alert("Default sort", "How should ideas be sorted in your feed?", [
      { text: "Newest first", onPress: () => setSortOrder("Newest first") },
      { text: "Oldest first", onPress: () => setSortOrder("Oldest first") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function openNotificationSettings() {
    Linking.openSettings();
  }

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          // TODO: Clerk signOut()
          console.log("Signing out");
        },
      },
    ]);
  }

  return (
    <View className="flex-1">
      <SafeAreaView
        className="px-6 pt-6 pb-3"
        style={{ backgroundColor: Colors.primaryDark }}
      >
        {/* ── Header ── */}
        <Text
          className="text-[29px] font-semibold tracking-tight"
          style={{ color: Colors.textOnDark }}
        >
          Settings
        </Text>
      </SafeAreaView>

      {/* ── Body ── */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        style={{ backgroundColor: Colors.screenBg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Profile ── */}
        <SectionCard>
          <TouchableOpacity
            className="flex-row items-center gap-4 px-4 py-4"
            activeOpacity={0.75}
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.brandTeal }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: Colors.textOnDark }}
              >
                AB
              </Text>
            </View>
            <View className="gap-0.5">
              <Text
                className="text-lg font-semibold"
                style={{ color: Colors.textPrimary }}
              >
                Alex Brown
              </Text>
              <Text className="text-sm" style={{ color: Colors.textMuted }}>
                alex@example.com
              </Text>
            </View>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Resurfacing ── */}
        <SectionCard>
          <SectionLabel label="Resurfacing" />

          {/* Daily nudge toggle */}
          <View className="flex-row items-center justify-between px-4 pb-4">
            <View className="flex-1 gap-0.5 pr-4">
              <Text
                className="text-[15px] font-medium"
                style={{ color: Colors.textPrimary }}
              >
                Daily nudge
              </Text>
              <Text
                className="text-[13px]"
                style={{ color: Colors.accentTeal }}
              >
                Get reminded of a random old idea
              </Text>
            </View>
            <Switch
              value={dailyNudge}
              onValueChange={setDailyNudge}
              trackColor={{
                false: Colors.cardBorder,
                true: Colors.brandTeal,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.cardBorder}
            />
          </View>

          <Divider />

          {/* Cadence */}
          <SettingsRow
            label="Cadence"
            value={cadence}
            onPress={dailyNudge ? pickCadence : undefined}
            showChevron={dailyNudge}
            valueColor={dailyNudge ? Colors.brandTeal : Colors.textMuted}
          />
        </SectionCard>

        {/* ── Idea ageing ── */}
        <SectionCard>
          <SectionLabel label="Idea Ageing" />
          <SettingsRow
            label="Age badge after"
            value={agingThreshold}
            onPress={pickAgingThreshold}
          />
        </SectionCard>

        {/* ── Feed ── */}
        <SectionCard>
          <SectionLabel label="Feed" />
          <SettingsRow
            label="Default sort"
            value={sortOrder}
            onPress={pickSortOrder}
          />
        </SectionCard>

        {/* ── Account ── */}
        <SectionCard>
          <SectionLabel label="Account" />

          {/* Notifications */}
          <SettingsRow
            label="Notifications"
            value="Enabled"
            onPress={openNotificationSettings}
            showChevron={false}
            icon={
              <Ionicons
                name="open-outline"
                size={14}
                color={Colors.brandTeal}
              />
            }
          />

          <Divider />

          {/* Sign out */}
          <TouchableOpacity
            className="px-4 py-4"
            onPress={handleSignOut}
            activeOpacity={0.65}
          >
            <Text
              className="text-lg font-medium"
              style={{ color: Colors.destructive }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
        </SectionCard>
      </ScrollView>
    </View>
  );
}
