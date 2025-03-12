import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileFrame from "@/components/shared/mobile-frame/components";
import Navigation from "@/components/shared/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "배당 계산기",
  description: "배당 계산 및 백테스팅 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <MobileFrame
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col h-full">
          <Navigation />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </MobileFrame>
    </html>
  );
}
