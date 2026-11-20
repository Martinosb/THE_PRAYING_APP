import React from "react";
import {
  Text,
  View,
  Pressable,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
export const c = {
  paper: "#F8F5EB",
  ink: "#193C33",
  sub: "#53675B",
  line: "#DADBCD",
  gold: "#F1CC88",
  pale: "#E7EBDD",
  white: "#FFFDF6",
};
export const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});
export const s = StyleSheet.create({
  body: { flex: 1, backgroundColor: c.paper },
  page: {
    padding: 22,
    paddingBottom: 40,
    gap: 18,
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
  },
  title: { fontFamily: serif, fontSize: 42, lineHeight: 51, color: c.ink },
  heading: { fontFamily: serif, fontSize: 26, lineHeight: 34, color: c.ink },
  copy: { fontSize: 16, lineHeight: 24, color: c.sub },
  kicker: { fontSize: 12, fontWeight: "700", letterSpacing: 1.4, color: c.sub },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  card: { backgroundColor: c.ink, borderRadius: 20, padding: 22, gap: 16 },
  rule: { height: 1, backgroundColor: c.line },
});
export function T({ children, style = undefined, ...props }) {
  return (
    <Text {...props} style={[s.copy, style]}>
      {children}
    </Text>
  );
}
export function Button({
  children,
  onPress,
  quiet = false,
  selected = false,
  disabled = false,
  label = undefined,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: quiet && !selected ? c.line : c.ink,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: quiet ? (selected ? c.pale : c.white) : c.ink,
        opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
      })}
    >
      <T style={{ fontWeight: "600", color: quiet ? c.ink : c.white }}>
        {children}
      </T>
    </Pressable>
  );
}
export function Field({ label, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      <T style={{ fontWeight: "600", color: c.ink }}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.sub}
        {...props}
        style={{
          backgroundColor: c.white,
          color: c.ink,
          borderColor: "#839184",
          borderWidth: 1,
          borderRadius: 10,
          padding: 13,
          minHeight: props.multiline ? 96 : 50,
          textAlignVertical: props.multiline ? "top" : "center",
          fontSize: 17,
        }}
      />
    </View>
  );
}
