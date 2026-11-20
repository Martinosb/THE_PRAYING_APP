import React, { useEffect, useState, useContext, createContext } from "react";
import { client } from "./account";
import { useBook } from "./state";
const BookContext = createContext(null);
export const usePrayer = () => useContext(BookContext);
export function Provider({ children }) {
  const [session, setSession] = useState(client ? undefined : null);
  useEffect(() => {
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((_event, value) =>
      setSession(value),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const owner = session?.user.id || "guest";
  const state = useBook(owner);
  if (session === undefined) return null;
  return (
    <BookContext.Provider value={{ ...state, session, owner }}>
      {children}
    </BookContext.Provider>
  );
}
