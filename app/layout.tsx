import { ClerkProvider } from "@clerk/nextjs";
import { Roboto } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";

import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

import "./globals.css";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  themeColor: "#0E78F9",
  colorScheme: "dark",
};

export const metadata: Metadata = siteConfig;

const AppLayout = ({ children }: Readonly<PropsWithChildren>) => {
  const envKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isPlaceholderKey = (key: string | undefined) => 
    !key || key.includes("XXXXX") || key.includes("your_") || key === "placeholder";
  
  const isPlaceholder = isPlaceholderKey(envKey);
  // A valid-formatted (though fake) key to satisfy SDK initialization regex: clerk.eburon.ai$
  const publishableKey = isPlaceholder ? "pk_test_Y2xlcmsuZWJ1cm9uLmFpJA==" : envKey!;

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={{
          layout: {
            logoImageUrl: "https://zoomie.eburon.ai/icons/logo.png",
            socialButtonsVariant: "iconButton",
          },
          variables: {
            colorText: "#FFF",
            colorPrimary: "#0E78F9",
            colorBackground: "#050505",
            colorInputBackground: "#111",
            colorInputText: "#FFF",
          },
        }}
      >
        <body className={cn("min-h-screen font-sans antialiased text-white selection:bg-blue-500/30", roboto.variable)}>
          <div className="premium-bg fixed inset-0 -z-10 bg-[#050505]" />
          <div className="mesh-gradient fixed inset-0 -z-10 opacity-40 blur-[100px]" />
          {children}
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
};

export default AppLayout;
