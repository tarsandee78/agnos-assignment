import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Noto_Sans_Thai, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Agnos Patient Intake & Staff Monitoring",
  description: "Real-time responsive patient intake form and hospital staff monitoring system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn("font-sans", notoSansThai.variable, plusJakarta.variable, geistMono.variable)}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

