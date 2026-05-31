"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronDown, Download, Wrench, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEAL = "#1D9E75";
const TEAL_MIST = "#E1F5EE";
const CHARCOAL = "#2C2C2A";

function profileInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : "?";
}

interface UserProfile {
  id: string;
  name: string;
}

export default function ProfileSwitcher() {
  const hydrated = useUserStoreHydrated();
  const activeUserId = useUserStore((state) => state.activeUserId);
  const authenticatedUserId = useUserStore((state) => state.authenticatedUserId);
  const isAdmin = useUserStore((state) => state.isAdmin);
  const setActiveUser = useUserStore((state) => state.setActiveUser);
  const clearAuth = useUserStore((state) => state.clearAuth);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!hydrated || !authenticatedUserId) return;
    
    if (isAdmin) {
      supabase.from("users").select("id, name").then(({ data }) => {
        if (data) setUsers(data);
      });
    } else {
      supabase.from("users").select("id, name").eq("id", authenticatedUserId).single().then(({ data }) => {
        if (data) setUsers([data]);
      });
    }
  }, [isAdmin, authenticatedUserId, hydrated]);

  useEffect(() => {
    if (users.length > 0 && activeUserId && authenticatedUserId) {
      if (!users.some(u => u.id === activeUserId)) {
         setActiveUser(authenticatedUserId);
      }
    } else if (users.length > 0 && !activeUserId && authenticatedUserId) {
       setActiveUser(authenticatedUserId);
    }
  }, [users, activeUserId, authenticatedUserId, setActiveUser]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, closeMenu]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    router.push("/login");
  };

  if (!hydrated || !authenticatedUserId) {
    return (
      <div className="h-10 w-36 animate-pulse rounded-full" style={{ backgroundColor: TEAL_MIST }} aria-hidden />
    );
  }

  const activeProfile = users.find((p) => p.id === activeUserId) ?? users.find((p) => p.id === authenticatedUserId);
  const displayName = activeProfile?.name ?? "My Profile";

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-[#2C2C2A] hover:text-[#1D9E75] transition-colors">
          <User className="size-4" />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          "flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
        style={{ color: TEAL, ["--tw-ring-color" as string]: TEAL } as CSSProperties}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: TEAL_MIST, color: TEAL }}
          aria-hidden
        >
          {profileInitial(displayName)}
        </span>
        <span className="max-w-[7rem] truncate" style={{ color: CHARCOAL }}>
          {displayName}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          style={{ color: TEAL }}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Switch profile"
          className="absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border shadow-md"
          style={{ borderColor: TEAL_MIST, backgroundColor: "#2C2C2A" }}
        >
          {users.map((profile) => {
            const isActive = profile.id === activeUserId;
            return (
              <li key={profile.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:opacity-90 text-white"
                  style={{ backgroundColor: isActive ? "#3f3f3c" : "#2C2C2A" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#3f3f3c"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#2C2C2A"; }}
                  onClick={() => { setActiveUser(profile.id); closeMenu(); }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: TEAL_MIST, color: TEAL }} aria-hidden>
                    {profileInitial(profile.name)}
                  </span>
                  <span className="flex-1 font-medium">{profile.name}</span>
                  {isActive && <Check className="size-4 shrink-0" style={{ color: TEAL }} aria-hidden />}
                </button>
              </li>
            );
          })}
          
          <div className="h-px w-full bg-[#888780] opacity-20 my-1" />
          
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors text-white"
              style={{ backgroundColor: "#2C2C2A" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3f3f3c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2C2C2A"; }}
              onClick={() => { window.location.href = "/admin/plan-builder"; closeMenu(); }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "transparent" }} aria-hidden>
                <Wrench className="size-4 shrink-0 text-white" />
              </span>
              <span className="flex-1 font-medium">Plan Builder</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors text-white"
              style={{ backgroundColor: "#2C2C2A" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3f3f3c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2C2C2A"; }}
              onClick={() => { window.location.href = "/profile"; closeMenu(); }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "transparent" }} aria-hidden>
                <User className="size-4 shrink-0 text-white" />
              </span>
              <span className="flex-1 font-medium">My Profile</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors text-white"
              style={{ backgroundColor: "#2C2C2A" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3f3f3c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2C2C2A"; }}
              onClick={() => { window.location.href = `/api/export?userId=${activeUserId || authenticatedUserId}`; closeMenu(); }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "transparent" }} aria-hidden>
                <Download className="size-4 shrink-0 text-white" />
              </span>
              <span className="flex-1 font-medium">Export Data</span>
            </button>
          </li>

          <div className="h-px w-full bg-[#888780] opacity-20 my-1" />

          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors text-red-400"
              style={{ backgroundColor: "#2C2C2A" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#451a1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2C2C2A"; }}
              onClick={() => { handleSignOut(); closeMenu(); }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "transparent" }} aria-hidden>
                <LogOut className="size-4 shrink-0 text-red-400" />
              </span>
              <span className="flex-1 font-medium">Sign Out</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
