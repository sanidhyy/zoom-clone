import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";

import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0E78F9",
  colorScheme: "dark",
};

export const metadata: Metadata = siteConfig;

const AppLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <ClerkProvider
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
        <body className={cn("min-h-screen font-sans antialiased text-white selection:bg-blue-500/30", inter.variable)}>
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
