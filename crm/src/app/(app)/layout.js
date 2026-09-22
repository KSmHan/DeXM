import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="bg-navy-deep border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="DeXM" width={34} height={34} className="rounded" />
            <span className="text-cream font-semibold tracking-tight text-lg hidden sm:inline">
              DeXM CRM
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/companies/new"
              className="text-sm font-medium bg-gold hover:bg-gold-light text-navy-deep rounded-lg px-3.5 py-2 transition"
            >
              + Добавить компанию
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
