import type { Metadata, Viewport } from "next";
import { Google_Sans, Google_Sans_Code, Google_Sans_Flex, Inter, Outfit } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/providers/MotionProvider";

// DevFest brand type: Google Sans for text, Google Sans Flex (variable width)
// for display headlines, Google Sans Code for labels.
const googleSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
});

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  axes: ["wdth", "opsz", "ROND"],
  variable: "--font-google-sans-flex",
  display: "swap",
  adjustFontFallback: false, // no metric overrides published for this font yet
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-google-sans-code",
  display: "swap",
  adjustFontFallback: false,
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
      className={`${googleSans.variable} ${googleSansFlex.variable} ${googleSansCode.variable} ${outfit.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
