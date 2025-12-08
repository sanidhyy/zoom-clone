import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "./mobile-nav";

export const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-black/80 backdrop-blur-xl px-6 py-4 lg:px-10 border-b border-white/5">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="https://zoomie.eburon.ai/icons/logo.png"
          alt="Eburon logo"
          width={40}
          height={40}
          className="max-sm:size-10"
        />

        <p className="text-[22px] font-semibold text-white max-sm:hidden tracking-tight">
          Eburon
        </p>
      </Link>

      <div className="flex-between gap-5">
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>

        <MobileNav />
      </div>
    </nav>
  );
};
