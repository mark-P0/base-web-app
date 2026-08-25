import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isDevelopmentEnvironment } from "@/lib/environment/is-development-environment";

export const metadata: Metadata = {
  description: "Development previews and diagnostics for Base Web App.",
  robots: {
    follow: false,
    index: false,
  },
  title: {
    default: "Development",
    template: "%s | Development | Base Web App",
  },
};

export default function DevelopmentLayout(props: { children: ReactNode }) {
  const { children } = props;

  const isDevelopment = isDevelopmentEnvironment();

  if (!isDevelopment) {
    notFound();
  }

  return children;
}
