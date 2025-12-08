"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SIDEBAR_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <button className="sm:hidden p-2 rounded-lg hover:bg-dark-3/50 transition-colors">
            <span className="material-symbols-rounded text-2xl text-white">
              menu
            </span>
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="border-none bg-dark-1">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://zoomie.eburon.ai/icons/logo.png"
                alt="Eburon logo"
                width={36}
                height={36}
                className="max-sm:size-10"
              />

              <p className="text-[26px] font-bold text-white">Eburon</p>
            </Link>
          </SheetClose>

          <div className="flex h-[calc(100vh_-_72px)] flex-col justify-between overflow-y-auto">
            <section className="flex h-full flex-col gap-3 pt-16 text-white">
              {SIDEBAR_LINKS.map((item) => {
                const isActive =
                  pathname === item.route ||
                  pathname.startsWith(`${item.route}/`);

                return (
                  <SheetClose key={item.route} asChild>
                    <Link
                      href={item.route}
                      className={cn(
                        "flex w-full max-w-60 items-center gap-4 rounded-xl p-4 transition-all duration-300",
                        {
                          "bg-blue-1 shadow-lg shadow-blue-1/25": isActive,
                          "hover:bg-dark-3/50": !isActive,
                        }
                      )}
                    >
                      <span
                        className={cn(
                          "material-symbols-rounded text-2xl",
                          isActive && "filled"
                        )}
                      >
                        {item.icon}
                      </span>

                      <p className="font-semibold">{item.label}</p>
                    </Link>
                  </SheetClose>
                );
              })}
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};
