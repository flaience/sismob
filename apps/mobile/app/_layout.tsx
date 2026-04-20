import React from "react";
import { Tabs } from "expo-router";
import { Search, User, Camera, Layers } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366f1", // Indigo 600
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color }) => {
            const Icon: any = Search; // Casting para anular o erro de tipo
            return <Icon size={24} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Gestão",
          tabBarIcon: ({ color }) => {
            const Icon: any = Layers; // Casting para anular o erro de tipo
            return <Icon size={24} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
