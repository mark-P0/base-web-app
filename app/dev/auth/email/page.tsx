import type { Metadata } from "next";
import { EmailAuthDevelopmentPage } from "@/lib/auth/development/EmailAuthDevelopmentPage.client";

export const metadata: Metadata = {
  title: "Email authentication",
};

export default function EmailAuthenticationDevelopmentPage() {
  return <EmailAuthDevelopmentPage />;
}
