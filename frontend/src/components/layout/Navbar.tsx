"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  showEndSession?: boolean;
  onEndSession?: () => void;
}

export function Navbar({ showEndSession, onEndSession }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[#FAFAFA] hover:text-[#F97316] transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F97316]">
            <span className="text-xs font-bold text-black">U</span>
          </div>
          <span className="text-sm">Uncooked</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showEndSession && onEndSession && (
            <button
              onClick={onEndSession}
              className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:border-[#F97316]/50 hover:text-[#FAFAFA]"
            >
              End session
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#71717A] transition-colors hover:text-[#FAFAFA]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
