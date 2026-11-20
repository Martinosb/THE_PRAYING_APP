// Run against a disposable local Supabase stack with the portal migrations.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { apply, day, empty, importGuest, synchronize } from "../src/book.js";

const url = process.env.TEST_SUPABASE_URL || "http://127.0.0.1:54321";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(url).hostname));
const key = process.env.TEST_SUPABASE_ANON_KEY;
assert.ok(key, "Set TEST_SUPABASE_ANON_KEY for the local test stack.");
const makeClient = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const client = makeClient();
const email = randomUUID() + "@example.com";
const password = randomUUID();
const signup = await client.auth.signUp({ email, password });
assert.ifError(signup.error);
await client.auth.signOut();
const login = await client.auth.signInWithPassword({ email, password });
assert.ifError(login.error);
const owner = login.data.user.id;
const stamp = new Date().toISOString();
// Simulate first use with no network, followed by guest import into the account.
let guest = apply(empty(), 0, {
  id: randomUUID(),
  name: "Family",
  created_at: stamp,
});
guest = apply(guest, 1, {
  id: randomUUID(),
  category_id: guest.categories[0].id,
  title: "Peace at home",
  status: "active",
  created_at: stamp,
});
guest = apply(guest, 2, {
  id: randomUUID(),
  request_id: guest.requests[0].id,
  prayed_on: day(),
  created_at: stamp,
});
let book = importGuest(empty(), guest, randomUUID);
assert.equal(importGuest(book, guest, randomUUID).pending.length, 3);
// The same category was independently created on the web before this phone reconnected.
const category = await client
  .from("portal_categories")
  .insert({ name: "Family", user_id: owner })
  .select()
  .single();
assert.ifError(category.error);
book = apply(book, 1, {
  id: book.requests[0].id,
  status: "answered",
  answered_at: stamp,
});
const offline = JSON.parse(JSON.stringify(book));
const received = await synchronize(offline, client, owner);
assert.equal(received.categories.length, 1);
assert.equal(received.requests[0].category_id, category.data.id);
assert.equal(received.logs.length, 1);
assert.equal(received.requests[0].status, "answered");
// Replay after an interrupted acknowledgement, then read on a second signed-in device.
const retried = await synchronize(offline, client, owner);
assert.equal(retried.logs.length, 1);
assert.equal(retried.requests.length, 1);
const phone2 = makeClient();
assert.ifError(
  (await phone2.auth.signInWithPassword({ email, password })).error,
);
assert.deepEqual(await synchronize(empty(), phone2, owner), retried);
const stranger = makeClient();
const other = await stranger.auth.signUp({
  email: randomUUID() + "@example.com",
  password: randomUUID(),
});
assert.ifError(other.error);
const hidden = await stranger
  .from("portal_prayer_requests")
  .select("*")
  .eq("user_id", owner);
assert.ifError(hidden.error);
assert.equal(hidden.data.length, 0);
console.log(
  "Passed sign-in, guest import, offline changes, category reconciliation, retry, second-device sync and account isolation.",
);
