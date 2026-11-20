import React from "react";
import { View, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { randomUUID } from "expo-crypto";
import { usePrayer } from "../context";
import { apply, day } from "../book";
import { Frame, useAction } from "../frame";
import { T, c, s, Button } from "../ui";
export default function Prayer() {
  const { id } = useLocalSearchParams(),
    { book, edit, sync } = usePrayer(),
    { act, error, busy } = useAction();
  const r = book?.requests.find((item) => item.id === id);
  if (!r)
    return (
      <Frame back>
        <T>{book ? "Request unavailable." : "Opening prayer…"}</T>
      </Frame>
    );
  const logs = book.logs
    .filter((l) => l.request_id === id)
    .sort((a, b) => b.prayed_on.localeCompare(a.prayed_on));
  const prayed = logs.some((l) => l.prayed_on === day());
  function mark() {
    return act(async () => {
      await edit((old) => {
        if (old.logs.some((l) => l.request_id === id && l.prayed_on === day()))
          return old;
        return apply(old, 2, {
          id: randomUUID(),
          request_id: id,
          prayed_on: day(),
          created_at: new Date().toISOString(),
        });
      });
      sync();
    });
  }
  function status(value) {
    return act(async () => {
      await edit((old) =>
        apply(old, 1, {
          id,
          status: value,
          answered_at: value === "answered" ? new Date().toISOString() : null,
        }),
      );
      sync();
    });
  }
  return (
    <Frame back>
      <T style={s.kicker}>
        {book.categories
          .find((c) => c.id === r.category_id)
          ?.name.toUpperCase()}{" "}
        · {r.status.toUpperCase()}
      </T>
      <T style={s.title}>{r.title}</T>
      {!!r.details && <T>{r.details}</T>}
      {r.answered_at && (
        <T>Answered {new Date(r.answered_at).toLocaleDateString()}</T>
      )}
      {r.status === "active" &&
        (prayed ? (
          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: 16,
              backgroundColor: c.pale,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <T style={{ color: c.ink }}>✓ Prayed today</T>
          </View>
        ) : (
          <Button disabled={busy} onPress={mark}>
            Mark prayed today
          </Button>
        ))}
      <Button
        quiet
        disabled={busy}
        onPress={() => status(r.status === "active" ? "answered" : "active")}
      >
        {r.status === "active"
          ? "Mark as answered"
          : "Return to active prayers"}
      </Button>
      {r.status === "active" && (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={{ alignSelf: "flex-start", paddingVertical: 12 }}
          onPress={() => status("archived")}
        >
          <T>Archive request</T>
        </Pressable>
      )}
      {error}
      <View style={s.rule} />
      <T style={s.heading}>Prayer history</T>
      {logs.length ? (
        logs.map((l) => (
          <T key={l.id}>
            ✓{" "}
            {new Date(l.prayed_on + "T12:00:00").toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </T>
        ))
      ) : (
        <T>Your first prayer date will appear here.</T>
      )}
    </Frame>
  );
}
