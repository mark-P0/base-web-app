import type { Metadata } from "next";
import "@/lib/styles/tailwind.css";
import { ThemeToggle } from "@/lib/dark-mode/ThemeToggle.client";
import { isDevelopmentEnvironment } from "@/lib/environment/is-development-environment";
import { GlobalErrorPreviewTrigger } from "@/lib/next-handlers/GlobalErrorPreviewTrigger.client";
import { cn } from "@/lib/shadcn/utils";
import { geistMono, geistSans } from "@/lib/styles/fonts";

export const metadata: Metadata = {
  title: "Hello, world!",
};

function GlobalErrorPreviewTriggerContainer() {
  const isDevelopment = isDevelopmentEnvironment();

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <GlobalErrorPreviewTrigger />
    </div>
  );
}

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
        <GlobalErrorPreviewTriggerContainer />
      </body>
    </html>
  );
}
