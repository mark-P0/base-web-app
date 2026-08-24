import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthDevelopmentLayout as AuthDevelopmentLayoutContent } from "@/lib/auth/development/AuthDevelopmentLayout";

export const metadata: Metadata = {
  description: "Authentication demonstrations and diagnostics.",
  title: "Authentication",
};

export default function AuthDevelopmentRouteLayout(props: {
  children: ReactNode;
}) {
  const { children } = props;

  return (
    <AuthDevelopmentLayoutContent>{children}</AuthDevelopmentLayoutContent>
  );
}
