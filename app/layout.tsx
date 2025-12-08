import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Roboto, Open_Sans } from "next/font/google";
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
  variable: "--font-roboto"
});

const openSans = Open_Sans({ 
  subsets: ["latin"],
  variable: "--font-open-sans"
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
            colorBackground: "#1C1F2E",
            colorInputBackground: "#252A41",
            colorInputText: "#FFF",
          },
        }}
      >
        <body className={cn("min-h-screen bg-dark-2 font-sans antialiased", openSans.variable, roboto.variable)}>
          {children}
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
};

export default AppLayout;
