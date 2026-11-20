import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "../context";
import { c } from "../ui";
export default function Layout() {
  return (
    <Provider>
      <StatusBar style="dark" />
      <Stack
        id="prayer"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.paper },
        }}
      />
    </Provider>
  );
}
