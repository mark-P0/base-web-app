import { notFound } from "next/navigation";

export default function DevelopmentLayout(props: LayoutProps<"/dev">) {
  const { children } = props;

  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return children;
}
