import type { PropsWithChildren } from "react";

import { StreamClientProvider } from "@/providers/stream-client-provider";

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <StreamClientProvider>{children}</StreamClientProvider>
    </main>
  );
};

export default RootLayout;
