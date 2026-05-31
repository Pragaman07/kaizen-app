import ProfileSwitcher from "@/components/layout/ProfileSwitcher";
import Link from "next/link";

const HEADER_BG = "#F8F7F4";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: HEADER_BG,
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/icons/icon-192.png" alt="Kaizen Logo" className="w-8 h-8 rounded-md" />
          <span className="font-heading text-xl font-bold tracking-tight text-primary">Kaizen</span>
        </Link>
        <ProfileSwitcher />
      </div>
    </header>
  );
}
