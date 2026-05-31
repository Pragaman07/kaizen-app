import ProfileSwitcher from "@/components/layout/ProfileSwitcher";

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
        <div className="flex items-center gap-2">
          <span
            className="font-heading text-2xl leading-none tracking-tight text-primary"
            aria-label="Kaizen"
          >
            改善
          </span>
          <span className="sr-only">Kaizen</span>
        </div>
        <ProfileSwitcher />
      </div>
    </header>
  );
}
