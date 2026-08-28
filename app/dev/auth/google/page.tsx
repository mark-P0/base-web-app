import type { Metadata } from "next";
import { GoogleAuthDevelopmentPage } from "@/lib/auth/development/GoogleAuthDevelopmentPage.client";
import { serverEnvironment } from "@/lib/environment/server";

export const metadata: Metadata = {
  title: "Google authentication",
};

export default function GoogleAuthenticationDevelopmentPage() {
  const isGoogleConfigured = Boolean(serverEnvironment.googleCredentials);

  return <GoogleAuthDevelopmentPage isGoogleConfigured={isGoogleConfigured} />;
}
