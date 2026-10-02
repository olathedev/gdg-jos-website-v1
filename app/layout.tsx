import type { Metadata, Viewport } from "next";
import { Google_Sans, Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import MotionProvider from "@/providers/MotionProvider";

// Two typefaces: Google Sans (DevFest brand) for text and UI, Clash Display for headings.
const googleSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
});

// Clash Display (Fontshare, ITF Free Font License) for headings and big numbers.
const clashDisplay = localFont({
  src: [
    { path: "./fonts/clash-display/ClashDisplay-500.woff2", weight: "500" },
    { path: "./fonts/clash-display/ClashDisplay-600.woff2", weight: "600" },
    { path: "./fonts/clash-display/ClashDisplay-700.woff2", weight: "700" },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

// Still used by the 2025 archive pages under /devfest/*.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
});

export const metadata: Metadata = {
  title: "DevFest Jos 2026 · GDG Jos",
  description:
    "DevFest Jos 2026: talks, workshops and community for developers, designers and builders in Jos, Plateau State. Hosted by Google Developer Groups Jos.",
  openGraph: {
    title: "DevFest Jos 2026",
    description: "The developer festival of the Plateau, hosted by GDG Jos.",
    images: ["https://res.cloudinary.com/dxssytv0p/image/upload/f_auto,q_auto,w_1200/v1758289190/devfestbanner_v12utp.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so theme tokens defined on :root can resolve them.
    <html
      lang="en"
      className={`${googleSans.variable} ${clashDisplay.variable} ${outfit.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
