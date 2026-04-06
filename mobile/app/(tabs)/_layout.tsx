import React from "react";
import { Tabs } from "expo-router";
import { Home, LayoutGrid, MessageSquare, User } from "lucide-react-native";
import { COLORS } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          height: 80,
          paddingBottom: 25,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <Home size={26} color={color} fill={focused ? COLORS.primary + '20' : 'transparent'} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => <LayoutGrid size={26} color={color} fill={focused ? COLORS.primary + '20' : 'transparent'} />,
        }}
      />
      <Tabs.Screen
        name="chats" // Placeholder for Chat screen
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => <MessageSquare size={26} color={color} fill={focused ? COLORS.primary + '20' : 'transparent'} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <User size={26} color={color} fill={focused ? COLORS.primary + '20' : 'transparent'} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
