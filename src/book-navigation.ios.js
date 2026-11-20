import React from "react";
import { NativeTabs } from "expo-router/native-tabs";
import { c } from "./ui";

export default function BookNavigation() {
  return (
    <NativeTabs tintColor={c.ink}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "sun.horizon", selected: "sun.horizon.fill" }}
        />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="requests">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book.closed", selected: "book.closed.fill" }}
        />
        <NativeTabs.Trigger.Label>Requests</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
