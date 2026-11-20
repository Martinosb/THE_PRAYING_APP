import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Frame } from "../../frame";
import { usePrayer } from "../../context";
import { T, c, s, Button } from "../../ui";
export default function Requests() {
  const { book } = usePrayer(),
    [filter, setFilter] = useState("active");
  const [categoryId, setCategoryId] = useState(null);
  const [choosingStatus, setChoosingStatus] = useState(false);
  const category = book?.categories.find((item) => item.id === categoryId);
  const rows =
    book?.requests
      .filter(
        (r) =>
          r.status === filter && (!category || r.category_id === category.id),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at)) || [];
  return (
    <Frame tab="Requests">
      <T style={s.title}>Requests</T>
      <Button onPress={() => router.push("/new")}>＋ New request</Button>
      {!!book?.categories.length && (
        <View style={{ gap: 8 }}>
          <T style={s.kicker}>CATEGORIES</T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[{ id: null, name: "All" }, ...book.categories].map((item) => {
              const selected = (category?.id ?? null) === item.id;
              return (
                <Button
                  key={item.id ?? "all"}
                  label={item.id ? `Category, ${item.name}` : "All categories"}
                  quiet={!selected}
                  selected={selected}
                  onPress={() => setCategoryId(item.id)}
                >
                  {item.name}
                </Button>
              );
            })}
          </ScrollView>
        </View>
      )}
      <View
        style={{ borderBottomWidth: 1, borderColor: c.line, paddingBottom: 4 }}
      >
        <View
          style={[s.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
        >
          <T>
            {rows.length} {rows.length === 1 ? "request" : "requests"}
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Status, ${filter}`}
            accessibilityState={{ expanded: choosingStatus }}
            onPress={() => setChoosingStatus((v) => !v)}
            style={{
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 8,
            }}
          >
            <T>
              Status · {filter[0].toUpperCase() + filter.slice(1)}{" "}
              {choosingStatus ? "▴" : "▾"}
            </T>
          </Pressable>
        </View>
        {choosingStatus && (
          <View style={s.wrap}>
            {["active", "answered", "archived"].map((value) => (
              <Button
                key={value}
                quiet
                selected={value === filter}
                onPress={() => {
                  setFilter(value);
                  setChoosingStatus(false);
                }}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </View>
        )}
      </View>
      {book?.categories.map((cat) => {
        const items = rows.filter((r) => r.category_id === cat.id);
        return (
          items.length > 0 && (
            <View key={cat.id} style={{ gap: 2 }}>
              {!category && <T style={s.kicker}>{cat.name.toUpperCase()}</T>}
              {items.map((row) => (
                <Pressable
                  accessibilityRole="button"
                  key={row.id}
                  onPress={() =>
                    router.push({ pathname: "/prayer", params: { id: row.id } })
                  }
                  style={{
                    borderBottomWidth: 1,
                    borderColor: c.line,
                    paddingVertical: 14,
                  }}
                >
                  <View style={[s.row, { justifyContent: "space-between" }]}>
                    <T style={[s.heading, { flex: 1 }]}>{row.title}</T>
                    <T accessible={false} style={{ fontSize: 22 }}>
                      ›
                    </T>
                  </View>
                  {!!row.details && <T numberOfLines={1}>{row.details}</T>}
                </Pressable>
              ))}
            </View>
          )
        );
      })}
      {book && !rows.length && (
        <T>
          {category
            ? `No ${filter} requests in ${category.name}.`
            : filter === "answered"
              ? "Prayers you mark answered will appear here."
              : filter === "archived"
                ? "Archived requests will appear here."
                : "Add a request to start your prayer list."}
        </T>
      )}
    </Frame>
  );
}
