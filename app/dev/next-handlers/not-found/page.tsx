import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Not Found Preview",
};

export default function NotFoundPreviewRoute() {
  notFound();
}
