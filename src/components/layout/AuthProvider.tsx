"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/useUserStore";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuthenticatedUser, clearAuth } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        setAuthenticatedUser(session.user.id, profile?.is_admin || false);
      } else if (mounted) {
        clearAuth();
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        setAuthenticatedUser(session.user.id, profile?.is_admin || false);
      } else {
        clearAuth();
      }
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthenticatedUser, clearAuth, router]);

  return <>{children}</>;
}
