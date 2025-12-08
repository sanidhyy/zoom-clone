"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SIDEBAR_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-black/95 backdrop-blur-xl p-6 pt-28 text-white max-sm:hidden lg:w-[264px] border-r border-white/5">
      <div className="flex flex-1 flex-col gap-2">
        {SIDEBAR_LINKS.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                "flex items-center justify-start gap-4 rounded-xl p-4 transition-all duration-300 ease-apple",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "material-symbols-rounded text-[22px]",
                  isActive && "filled"
                )}
              >
                {item.icon}
              </span>

              <p className={cn(
                "text-[15px] font-medium max-lg:hidden tracking-tight",
                isActive ? "text-white" : "text-inherit"
              )}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

