import React from "react";
import { Tabs } from "expo-router";
import { SafeAreaView, Platform, StyleSheet } from "react-native";
import * as Icons from "phosphor-react-native";

const _layout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#C7F02C",
          tabBarInactiveTintColor: "gray",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons.House size={size} color={color} weight="bold" />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons.ChartLineUp size={size} color={color} weight="bold" />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons.Wallet size={size} color={color} weight="bold" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons.User size={size} color={color} weight="bold" />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default _layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingBottom: Platform.OS === "android" ? 10 : 0, // extra padding for Android
  },
  tabBar: {
    backgroundColor: "#121212",
    borderTopWidth: 0,
    height: 65,
    paddingBottom: Platform.OS === "android" ? 10 : 20, // respects bottom safe area
  },
});
