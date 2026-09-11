import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "የክፍል አቴንዳንስ መከታተያ | Smart University Attendance",
  description:
    "ለኢትዮጵያ ዩኒቨርሲቲዎች የተዘጋጀ አስተማማኝ እና ዘመናዊ የቴሌግራም አቴንዳንስ ሲስተም።",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="am" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F9F6F0] text-[#2C221E] antialiased selection:bg-[#B8860B]/20 selection:text-[#B8860B]"
      >
        {children}
      </body>
    </html>
  );
}
