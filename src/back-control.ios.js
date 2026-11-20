import React, { useState, useEffect } from "react";
import { AccessibilityInfo, View, Pressable } from "react-native";
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { T, c } from "./ui";
export function BackControl({ onPress }) {
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((v) => {
      if (mounted) setReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduce,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  /** @type {import("react-native").ViewStyle} */
  const shape = { alignSelf: "flex-start", borderRadius: 24 };
  const action = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 18 }}
    >
      <T style={{ color: c.ink, fontWeight: "600" }}>‹ Back</T>
    </Pressable>
  );
  if (reduce || !isLiquidGlassAvailable() || !isGlassEffectAPIAvailable())
    return <View style={[shape, { backgroundColor: c.pale }]}>{action}</View>;
  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme="light"
      isInteractive
      style={shape}
    >
      {action}
    </GlassView>
  );
}
