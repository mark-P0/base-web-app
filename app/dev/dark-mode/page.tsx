import type { Metadata } from "next";
import { DarkModeDevelopmentPage } from "@/lib/dark-mode/DarkModeDevelopmentPage.client";

export const metadata: Metadata = {
  title: "Dark Mode",
};

export default function DarkModePage() {
  return <DarkModeDevelopmentPage />;
}
