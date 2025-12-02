"use client";

import { Loader2 } from "lucide-react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const LoadingOverlayContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function LoadingOverlayProvider({ children }) {
  const [activeCount, setActiveCount] = useState(0);

  const startLoading = useCallback(() => {
    setActiveCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveCount((count) => (count > 0 ? count - 1 : 0));
  }, []);

  const value = useMemo(
    () => ({
      isLoading: activeCount > 0,
      startLoading,
      stopLoading,
    }),
    [activeCount, startLoading, stopLoading]
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      {activeCount > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) {
    throw new Error("useLoadingOverlay must be used within a LoadingOverlayProvider");
  }
  return ctx;
}
