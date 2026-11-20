import React from "react";
import { View, Image } from "react-native";
import { router } from "expo-router";
import { Frame } from "../../frame";
import { usePrayer } from "../../context";
import { T, c, s, serif, Button } from "../../ui";
import icon from "../../../assets/icon.png";
import { day } from "../../book";
export default function Today() {
  const { book } = usePrayer(),
    now = new Date(),
    today = day(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - 6 + i);
    return date;
  });
  const logged = new Set(
    book?.logs.filter((l) => l.prayed_on === today).map((l) => l.request_id),
  );
  const active = book?.requests.filter((r) => r.status === "active") || [];
  const focus = active.find((r) => !logged.has(r.id)) || active[0];
  const dates = new Set(book?.logs.map((l) => l.prayed_on));
  return (
    <Frame tab="Today">
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <T style={[s.heading, { fontSize: 23 }]}>The Praying App</T>
        <T style={s.kicker}>PRAYER BOOK</T>
      </View>
      <View style={s.rule} />
      <View>
        <T style={s.kicker}>
          {now
            .toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
            .toUpperCase()}
        </T>
        <T style={s.title}>Today’s prayers</T>
      </View>
      {book && (
        <View style={s.card}>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <T style={[s.kicker, { color: c.gold }]}>
              {focus
                ? (
                    book.categories.find((c) => c.id === focus.category_id)
                      ?.name || "Prayer"
                  ).toUpperCase()
                : book.requests.length
                  ? "PRAYER REQUEST"
                  : "FIRST PRAYER"}
            </T>
            <Image source={icon} style={{ width: 54, height: 54 }} />
          </View>
          <T
            style={{
              fontFamily: serif,
              fontSize: 33,
              lineHeight: 40,
              color: c.white,
            }}
          >
            {focus?.title || "What’s on your heart?"}
          </T>
          <T numberOfLines={3} style={{ color: "#E2E9DB" }}>
            {focus
              ? focus.details ||
                (logged.has(focus.id)
                  ? "Prayed today"
                  : "Take a moment with this request.")
              : "Write a request you want to return to in prayer."}
          </T>
          <Button
            quiet
            onPress={() =>
              router.push(
                focus
                  ? { pathname: "/prayer", params: { id: focus.id } }
                  : "/new",
              )
            }
          >
            {focus
              ? "Open prayer"
              : book.requests.length
                ? "Add a request"
                : "Add your first request"}
          </Button>
        </View>
      )}
      <View style={{ gap: 12 }}>
        <T style={s.heading}>Your rhythm</T>
        <T>
          {dates.size
            ? "Days you prayed this past week"
            : "Days you pray will appear here."}
        </T>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {days.map((date) => {
            const key = day(date),
              yes = dates.has(key);
            return (
              <View
                key={key}
                accessible
                accessibilityLabel={
                  date.toDateString() +
                  (yes ? ", prayed" : ", no prayer logged")
                }
                style={{ alignItems: "center", gap: 6, flex: 1 }}
              >
                <T style={{ fontSize: 13 }}>
                  {date.toLocaleDateString(undefined, { weekday: "narrow" })}
                </T>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: yes ? c.ink : "transparent",
                    borderColor: key === today ? c.ink : "transparent",
                    borderWidth: 1,
                  }}
                >
                  <T style={{ color: yes ? c.white : c.sub, fontSize: 13 }}>
                    {yes ? "✓" : date.getDate()}
                  </T>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Frame>
  );
}
