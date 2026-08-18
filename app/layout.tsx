import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/lib/css/tailwind.css";
import { ThemeToggle } from "@/lib/dark-mode/ThemeToggle.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hello, world!",
};

export default function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script src="/dark-mode-init.js" />
      </head>
      <body className="font-sans">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
