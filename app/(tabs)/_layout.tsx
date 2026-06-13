import colors from "@/constants/colors";
import { useAuth } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, View } from "react-native";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to resolve before making any routing decision
  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.brandTeal }}
      >
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  function ActiveTabBar({
    children,
    focused,
  }: {
    children: React.ReactNode;
    focused: boolean;
  }) {
    return (
      <View
        className={`${focused ? "w-16 h-full flex-row justify-center items-center rounded-full" : undefined}`}
        style={{
          backgroundColor: focused ? "#96f4e9" : undefined,
        }}
      >
        {children}
      </View>
    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.lightTeal,
          borderTopWidth: 2,
          borderTopColor: "#96f4e9",
          paddingTop: 5,
          paddingVertical: 10,
          elevation: 0,
          marginBottom: 40,
          marginHorizontal: 30,
          borderRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "uppercase",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "The Lot",
          tabBarIcon: ({ color, focused }) => (
            <ActiveTabBar focused={focused}>
              <Image
                source={require("@/assets/notification-icon.png")}
                style={{
                  width: 50,
                  height: 50,
                  tintColor: color,
                }}
              />
            </ActiveTabBar>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, focused, size }) => (
            <ActiveTabBar focused={focused}>
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={size}
                color={color}
              />
            </ActiveTabBar>
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          tabBarLabel: "Tags",
          tabBarIcon: ({ color, focused, size }) => (
            <ActiveTabBar focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "tag" : "tag-outline"}
                size={size}
                color={color}
              />
            </ActiveTabBar>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused, size }) => (
            <ActiveTabBar focused={focused}>
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={color}
              />
            </ActiveTabBar>
          ),
        }}
      />
    </Tabs>
  );
}
