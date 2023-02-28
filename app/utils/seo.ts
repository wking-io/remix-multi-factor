import { removeTrailingSlash } from "~/utils/misc";

export function getUrl(requestInfo?: { origin: string; path: string }) {
  return removeTrailingSlash(
    `${requestInfo?.origin ?? "https://wking.dev"}${requestInfo?.path ?? ""}`
  );
}

export function getMetas({
  url,
  title = "A Sweet SaaS Starter for Remix | Softserve",
  description = "Build your SaaS faster with no bloat from unneeded features. We help walk you through our module library to kickstart your app the way you want it.",
  image = "https://some.image/url.png",
  keywords = "Software as a Service, SaaS Starter, Typescript Template",
}: {
  url: string;
  image?: string;
  title?: string;
  description?: string;
  keywords?: string;
}) {
  return {
    title,
    description,
    keywords,
    image,
    "og:url": url,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "twitter:card": image ? "summary_large_image" : "summary",
    "twitter:creator": "@wking__",
    "twitter:site": "@wking__",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
    "twitter:alt": title,
  };
}
