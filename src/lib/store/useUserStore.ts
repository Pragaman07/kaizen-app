"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
const STORAGE_KEY = "kaizen-user-vault-a";

interface UserState {
  activeUserId: string | null;
  authenticatedUserId: string | null;
  isAdmin: boolean;
  setActiveUser: (id: string) => void;
  setAuthenticatedUser: (id: string | null, isAdmin?: boolean) => void;
  clearAuth: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      activeUserId: null,
      authenticatedUserId: null,
      isAdmin: false,
      setActiveUser: (id: string) => set({ activeUserId: id }),
      setAuthenticatedUser: (id: string | null, isAdmin = false) => 
        set((state) => {
          const isNewLogin = state.authenticatedUserId !== id;
          const shouldResetActiveUser = !isAdmin || !state.activeUserId || isNewLogin;
          return {
            authenticatedUserId: id,
            isAdmin,
            activeUserId: shouldResetActiveUser ? id : state.activeUserId
          };
        }),
      clearAuth: () => set({ activeUserId: null, authenticatedUserId: null, isAdmin: false }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeUserId: state.activeUserId }), // Only persist active user so admins stay on the user they were editing
    },
  ),
);

/** Guards client components against SSR/localStorage hydration mismatches */
export function useUserStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { persist } = useUserStore;

    const markHydrated = () => setHydrated(true);

    const unsubFinish = persist.onFinishHydration(markHydrated);

    if (persist.hasHydrated()) {
      markHydrated();
    } else {
      void persist.rehydrate();
    }

    return unsubFinish;
  }, []);

  return hydrated;
}
