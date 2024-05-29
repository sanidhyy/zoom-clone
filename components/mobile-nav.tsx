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
          <Image
            src="/icons/hamburger.svg"
            alt="Open sidebar"
            width={36}
            height={36}
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>

        <SheetContent side="left" className="border-none bg-dark-1">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/icons/logo.svg"
                alt="Yoom logo"
                width={32}
                height={32}
                className="max-sm:size-10"
              />

              <p className="text-[26px] font-extrabold text-white">Yoom</p>
            </Link>
          </SheetClose>

          <div className="flex h-[calc(100vh_-_72px)] flex-col justify-between overflow-y-auto">
            <section className="flex h-full flex-col gap-6 pt-16 text-white">
              {SIDEBAR_LINKS.map((item) => {
                const isActive =
                  pathname === item.route ||
                  pathname.startsWith(`${item.route}/`);

                return (
                  <SheetClose key={item.route} asChild>
                    <Link
                      href={item.route}
                      className={cn(
                        "flex w-full max-w-60 items-center gap-4 rounded-lg p-4",
                        {
                          "bg-blue-1": isActive,
                        }
                      )}
                    >
                      <Image
                        src={item.imgUrl}
                        alt={item.label}
                        width={20}
                        height={20}
                      />

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
