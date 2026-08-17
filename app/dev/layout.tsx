import { notFound } from "next/navigation";

export default function DevelopmentLayout({ children }: LayoutProps<"/dev">) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return children;
}
