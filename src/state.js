import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { AppState } from "react-native";
import { client } from "./account";
import storage from "./storage";
import { empty, synchronize, apply } from "./book";
let queue = Promise.resolve();
/** @template T @param {() => Promise<T>} work @returns {Promise<T>} */
function run(work) {
  const job = queue.then(work);
  queue = job.then(
    () => {},
    () => {},
  );
  return job;
}
export function useBook(owner) {
  const key = "book.v1." + owner;
  const [view, setView] = useState(null),
    [status, setStatus] = useState("");
  const syncing = useRef(new Set()),
    current = useRef(key);
  useLayoutEffect(() => {
    current.current = key;
  }, [key]);
  const read = useCallback(
    async () => JSON.parse(await storage.getItem(key)) || empty(),
    [key],
  );
  const write = useCallback(
    async (book) => {
      await storage.setItem(key, JSON.stringify(book));
      if (current.current === key) setView({ key, book });
    },
    [key],
  );
  const edit = useCallback(
    (fn) => run(async () => write(fn(await read()))),
    [read, write],
  );
  const sync = useCallback(async () => {
    if (!client || owner === "guest" || syncing.current.has(key)) return;
    syncing.current.add(key);
    setStatus("Syncing…");
    try {
      let more;
      do {
        const snapshot = await run(read);
        const remote = await synchronize(snapshot, client, owner);
        more = await run(async () => {
          if (current.current !== key) return false;
          const local = await read();
          const tail = local.pending.slice(snapshot.pending.length);
          let next = { ...remote, imported: local.imported || {} };
          for (const { index, row } of tail) {
            let patch = row;
            if (
              index === 1 &&
              row.category_id &&
              !next.categories.some((c) => c.id === row.category_id)
            ) {
              const original = local.categories.find(
                (c) => c.id === row.category_id,
              );
              const merged = next.categories.find(
                (c) => c.name.toLowerCase() === original?.name.toLowerCase(),
              );
              if (merged) patch = { ...row, category_id: merged.id };
            }
            next = apply(next, index, patch);
          }
          await write(next);
          return tail.length > 0;
        });
      } while (more);
      if (current.current === key) setStatus("Up to date");
    } catch (e) {
      if (current.current === key) setStatus("Sync pending · " + e.message);
    } finally {
      syncing.current.delete(key);
    }
  }, [owner, key, read, write]);
  useEffect(() => {
    let alive = true;
    run(async () => {
      const book = await read();
      if (alive) setView({ key, book });
    })
      .then(() => {
        if (alive) sync();
      })
      .catch((e) => setStatus(e.message));
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") sync();
    });
    const timer = setInterval(() => {
      if (AppState.currentState !== "background") sync();
    }, 60000);
    return () => {
      alive = false;
      sub.remove();
      clearInterval(timer);
    };
  }, [key, read, sync]);
  return { book: view?.key === key ? view.book : null, edit, sync, status };
}
