"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Check, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUserStore,
  useUserStoreHydrated,
} from "@/lib/store/useUserStore";
import {
  DEFAULT_PROFILE_ID,
  isKnownProfileId,
  KAIZEN_PROFILES,
} from "@/lib/constants/profiles";

export { KAIZEN_PROFILES };

const TEAL = "#1D9E75";
const TEAL_MIST = "#E1F5EE";
const CHARCOAL = "#2C2C2A";

function profileInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function ProfileSwitcher() {
  const hydrated = useUserStoreHydrated();
  const activeUserId = useUserStore((state) => state.activeUserId);
  const setActiveUser = useUserStore((state) => state.setActiveUser);

  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProfile =
    KAIZEN_PROFILES.find((p) => p.id === activeUserId) ?? null;

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isKnownProfileId(activeUserId)) {
      setActiveUser(DEFAULT_PROFILE_ID);
    }
  }, [hydrated, activeUserId, setActiveUser]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  if (!hydrated) {
    return (
      <div
        className="h-10 w-36 animate-pulse rounded-full"
        style={{ backgroundColor: TEAL_MIST }}
        aria-hidden
      />
    );
  }

  const displayName = activeProfile?.name ?? "Select profile";

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
        style={
          {
            color: TEAL,
            ["--tw-ring-color" as string]: TEAL,
          } as CSSProperties
        }
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

      {open ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Switch profile"
          className="absolute right-0 z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border shadow-md"
          style={{
            borderColor: TEAL_MIST,
            backgroundColor: "#FFFFFF",
          }}
        >
          {KAIZEN_PROFILES.map((profile) => {
            const isActive = profile.id === activeUserId;
            return (
              <li key={profile.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:opacity-90"
                  style={{
                    color: CHARCOAL,
                    backgroundColor: isActive ? TEAL_MIST : "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = TEAL_MIST;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }
                  }}
                  onClick={() => {
                    setActiveUser(profile.id);
                    closeMenu();
                  }}
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: TEAL_MIST, color: TEAL }}
                    aria-hidden
                  >
                    {profileInitial(profile.name)}
                  </span>
                  <span className="flex-1 font-medium">{profile.name}</span>
                  {isActive ? (
                    <Check className="size-4 shrink-0" style={{ color: TEAL }} aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
          <div className="h-px w-full bg-[#888780] opacity-20 my-1" />
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100"
              style={{ color: CHARCOAL, backgroundColor: "#FFFFFF" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = TEAL_MIST;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
              onClick={() => {
                window.location.href = `/api/export?userId=${activeUserId}`;
                closeMenu();
              }}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{ backgroundColor: "transparent" }}
                aria-hidden
              >
                <Download className="size-4 shrink-0" style={{ color: CHARCOAL }} />
              </span>
              <span className="flex-1 font-medium">Export Data (.csv)</span>
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
