import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../lib/api";
import type { SessionData } from "./types";

type SessionContextValue = {
  restoring: boolean;
  session: SessionData | null;
  setSession: (session: SessionData | null) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<SessionData | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    api
      .refreshSession()
      .then((result) => setSessionState(result))
      .catch(() => setSessionState(null))
      .finally(() => setRestoring(false));
  }, []);

  function setSession(nextSession: SessionData | null) {
    setSessionState(nextSession);
  }

  async function signOut() {
    try {
      await api.logout();
    } finally {
      setSessionState(null);
    }
  }

  return (
    <SessionContext.Provider value={{ restoring, session, setSession, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return value;
}
