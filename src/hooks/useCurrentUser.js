// hooks/useCurrentUser.js
"use client";

import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const json = await res.json();
        if (!ignore && json.success) {
          setUser(json.data.user);
        }
      } catch (e) {
        console.error("useCurrentUser error", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return { user, loading };
}
