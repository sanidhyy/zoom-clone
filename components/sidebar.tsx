"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SIDEBAR_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        {SIDEBAR_LINKS.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                "flex items-center justify-start gap-4 rounded-lg p-4",
                {
                  "bg-blue-1": isActive,
                }
              )}
            >
              <Image
                src={item.imgUrl}
                alt={item.label}
                width={24}
                height={24}
              />

              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
