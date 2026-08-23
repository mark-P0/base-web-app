import { notFound } from "next/navigation";
import { isDevelopmentEnvironment } from "@/lib/environment/is-development-environment";

export default function DevelopmentLayout(props: LayoutProps<"/dev">) {
  const { children } = props;

  const isDevelopment = isDevelopmentEnvironment();

  if (!isDevelopment) {
    notFound();
  }

  return children;
}
