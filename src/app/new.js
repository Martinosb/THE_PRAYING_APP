import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { usePrayer } from "../context";
import { apply } from "../book";
import { Frame, useAction } from "../frame";
import { T, s, Field, Button } from "../ui";
export default function NewRequest() {
  const { book, edit, sync } = usePrayer(),
    [title, setTitle] = useState(""),
    [details, setDetails] = useState(""),
    [name, setName] = useState("");
  const { act, error, busy } = useAction();
  async function save() {
    if (!title.trim()) throw Error("Give your request a title.");
    const categoryName = name.trim() || "Personal",
      id = randomUUID(),
      created_at = new Date().toISOString();
    await edit((old) => {
      let next = old,
        category = old.categories.find(
          (item) => item.name.toLowerCase() === categoryName.toLowerCase(),
        );
      if (!category) {
        category = { id: randomUUID(), name: categoryName, created_at };
        next = apply(next, 0, category);
      }
      return apply(next, 1, {
        id,
        category_id: category.id,
        title: title.trim(),
        details: details.trim(),
        status: "active",
        created_at,
      });
    });
    sync();
    router.replace({ pathname: "/prayer", params: { id } });
  }
  return (
    <Frame back>
      <T style={s.title}>New request</T>
      <Field
        label="Prayer request"
        placeholder="What are you praying for?"
        value={title}
        onChangeText={setTitle}
        maxLength={240}
      />
      <Field
        label="Details (optional)"
        multiline
        value={details}
        onChangeText={setDetails}
      />
      <Field
        label="Category"
        placeholder="Personal"
        value={name}
        onChangeText={setName}
        maxLength={80}
      />
      <View style={s.wrap}>
        {(book?.categories.length
          ? book.categories.map((c) => c.name)
          : ["Personal", "Family", "Community"]
        ).map((n) => (
          <Button
            key={n}
            quiet
            selected={name === n}
            onPress={() => setName(n)}
          >
            {n}
          </Button>
        ))}
      </View>
      {error}
      <Button disabled={busy || !book} onPress={() => act(save)}>
        Save request
      </Button>
    </Frame>
  );
}
