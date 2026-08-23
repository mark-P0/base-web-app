import type { Metadata } from "next";
import "@/lib/styles/tailwind.css";
import { ThemeToggle } from "@/lib/dark-mode/ThemeToggle.client";
import { cn } from "@/lib/shadcn/utils";
import { geistMono, geistSans } from "@/lib/styles/fonts";

export const metadata: Metadata = {
  title: "Hello, world!",
};

export default function RootLayout(props: LayoutProps<"/">) {
  const { children } = props;

  return (
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable)}
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
