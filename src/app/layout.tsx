// app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { ThemeProvider } from "../components/theme-provider";
import BlurFade from "../components/ui/blur-fade";
import { ReactNode } from "react";
import { UserProvider } from "../context/UserContext";
import { YearProvider } from "@/context/YearContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "IV Team 07",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <UserProvider>
          <YearProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <BlurFade>
              {children}
            </BlurFade>
          </ThemeProvider>
          </YearProvider>
        </UserProvider>
      </body>
    </html>
  );
}
