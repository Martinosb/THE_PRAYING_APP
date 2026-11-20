import React from "react";
import { Pressable } from "react-native";
import { T } from "./ui";
export function BackControl({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      style={{ alignSelf: "flex-start", paddingVertical: 12, paddingRight: 14 }}
    >
      <T>‹ Back</T>
    </Pressable>
  );
}
