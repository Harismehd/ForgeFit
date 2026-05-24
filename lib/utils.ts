import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function youtubeEmbed(url: string) {
  const id = new URL(url).searchParams.get("v");
  return id ? `https://www.youtube.com/embed/${id}` : url;
}
