import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  const className = twMerge(clsx(inputs));

  return className;
}

export { cn };
