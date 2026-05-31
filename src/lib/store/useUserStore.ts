"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_PROFILE_ID,
  isKnownProfileId,
} from "@/lib/constants/profiles";

const STORAGE_KEY = "kaizen-user-vault-a";

interface UserState {
  activeUserId: string | null;
  setActiveUser: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      activeUserId: null,
      setActiveUser: (id: string) => set({ activeUserId: id }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeUserId: state.activeUserId }),
      onRehydrateStorage: () => (state) => {
        if (state && !isKnownProfileId(state.activeUserId)) {
          state.setActiveUser(DEFAULT_PROFILE_ID);
        }
      },
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
