import React, { useEffect, useState } from "react";
import { randomUUID } from "expo-crypto";
import { importGuest, empty } from "../../book";
import { View } from "react-native";
import { usePrayer } from "../../context";
import { client } from "../../account";
import storage from "../../storage";
import { reminder } from "../../reminders";
import { Frame, useAction } from "../../frame";
import { T, s, Field, Button } from "../../ui";
export default function Settings() {
  const { session, status, sync, edit, book } = usePrayer(),
    { act, error, busy } = useAction();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [time, setTime] = useState("07:00"),
    [saved, setSaved] = useState("");
  useEffect(() => {
    storage.getItem("daily-time").then((t) => {
      if (t) {
        setTime(t);
        setSaved(t);
      }
    });
  }, []);
  const [guest, setGuest] = useState(null);
  useEffect(() => {
    if (session)
      storage
        .getItem("book.v1.guest")
        .then((raw) => setGuest(JSON.parse(raw) || empty()));
  }, [session]);
  async function copyGuest() {
    await edit((current) => importGuest(current, guest, randomUUID));
    await sync();
  }
  async function save(t) {
    if (t && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))
      throw Error("Enter a 24-hour time, such as 07:30.");
    await reminder(t);
    await storage.setItem("daily-time", t);
    setSaved(t);
  }
  async function login() {
    const { error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    setPassword("");
  }
  return (
    <Frame tab="Settings">
      <T style={s.title}>Settings</T>
      <T style={s.heading}>Daily reminder</T>
      <T>
        {saved
          ? "Scheduled for " + saved + " on this device."
          : "Choose a quiet time for prayer."}
      </T>
      <Field
        label="Reminder time (24-hour)"
        value={time}
        onChangeText={setTime}
        maxLength={5}
      />
      <View style={s.wrap}>
        <Button disabled={busy} onPress={() => act(() => save(time))}>
          {saved ? "Update reminder" : "Set reminder"}
        </Button>
        {!!saved && (
          <Button quiet disabled={busy} onPress={() => act(() => save(""))}>
            Turn off
          </Button>
        )}
      </View>
      <View style={s.rule} />
      <T style={s.heading}>Prayer account</T>
      {!client ? (
        <T>
          Sign-in and sync are unavailable in this build. Guest prayers are
          saved on this device.
        </T>
      ) : session ? (
        <>
          <T>{session.user.email}</T>
          <T>{status}</T>
          {guest?.requests.some((r) => !book?.imported?.[r.id]) && (
            <Button quiet disabled={busy} onPress={() => act(copyGuest)}>
              Copy guest prayers to this account
            </Button>
          )}
          <Button quiet disabled={busy} onPress={() => act(sync)}>
            Sync now
          </Button>
          <Button
            quiet
            disabled={busy}
            onPress={() =>
              act(async () => {
                const { error } = await client.auth.signOut({ scope: "local" });
                if (error) throw error;
              })
            }
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <T>
            Sign in with your prayer portal account to sync your requests. Your
            guest book stays on this device, available when you sign out.
          </T>
          <Field
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            secureTextEntry
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
          />
          <Button disabled={busy} onPress={() => act(login)}>
            Sign in
          </Button>
        </>
      )}
      {error}
    </Frame>
  );
}
