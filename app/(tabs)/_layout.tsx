import colors from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabsLayout() {
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
          borderTopColor: "#E5E5E5",
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
          tabBarIcon: ({ color, focused, size }) => (
            <ActiveTabBar focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "archive" : "archive-outline"}
                size={size}
                color={color}
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
