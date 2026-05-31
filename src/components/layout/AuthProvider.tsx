"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/useUserStore";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setActiveUser, setAuthenticatedUser, setAdminStatus, clearAuth } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        setActiveUser(session.user.id);
        setAuthenticatedUser(session.user.id, false);
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        if (mounted) setAdminStatus(profile?.is_admin || false);
      } else if (mounted) {
        clearAuth();
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        setActiveUser(session.user.id);
        setAuthenticatedUser(session.user.id, false);
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        if (mounted) setAdminStatus(profile?.is_admin || false);
      } else {
        clearAuth();
      }
      if (['SIGNED_IN', 'INITIAL_SESSION', 'USER_UPDATED'].includes(event)) {
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setActiveUser, setAuthenticatedUser, setAdminStatus, clearAuth, router]);

  return <>{children}</>;
}
