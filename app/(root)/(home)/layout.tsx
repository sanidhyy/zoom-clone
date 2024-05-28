import type { PropsWithChildren } from "react";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

const HomeLayout = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
