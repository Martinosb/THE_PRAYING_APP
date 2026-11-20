import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BackControl } from "./back-control";
import { T, c, s } from "./ui";
export function Frame({ children, tab = undefined, back = false }) {
  return (
    <SafeAreaView style={s.body}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
        >
          {back && (
            <BackControl
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/")
              }
            />
          )}
          {children}
        </ScrollView>
        {tab && Platform.OS !== "ios" && (
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderColor: c.line,
              paddingVertical: 6,
              backgroundColor: c.paper,
            }}
          >
            {["Today", "Requests", "Settings"].map((name, i) => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityState={{ selected: name === tab }}
                onPress={() =>
                  router.replace(["/", "/requests", "/settings"][i])
                }
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 54,
                }}
              >
                <View
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    backgroundColor: name === tab ? c.pale : "transparent",
                    borderRadius: 20,
                  }}
                >
                  <T
                    style={{
                      fontWeight: name === tab ? "700" : "500",
                      color: c.ink,
                    }}
                  >
                    {name}
                  </T>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function useAction() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = React.useRef(false);
  async function act(fn) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    act,
    busy,
    error: error ? (
      <T accessibilityRole="alert" style={{ color: "#893B2C" }}>
        {error}
      </T>
    ) : null,
  };
}
