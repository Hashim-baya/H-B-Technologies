export const SERVICE_REDIRECTS: Record<string, string> = {
  "mobile-app-development": "mobile-development",
  "data-science": "data-engineering",
  "smart-cctv-installation": "smart-cctv",
  "automation-systems": "automation",
  "it-consultation": "it-consulting",
  "machine-learning": "artificial-intelligence",
  "natural-language-processing": "artificial-intelligence",
};

export const TEMPORARY_REDIRECTS = [
  {
    source: "/consultation",
    destination: "/book-consultation",
    statusCode: 302,
  },
] as const;

export function getCanonicalServiceSlug(slug: string) {
  return SERVICE_REDIRECTS[slug] ?? slug;
}

export function cleanPathname(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const collapsed = path.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.replace(/\/+$/g, "");
}

export function shouldCleanPathname(pathname: string) {
  return pathname !== cleanPathname(pathname) || pathname !== pathname.toLowerCase();
}

export function getCleanPathname(pathname: string) {
  return cleanPathname(pathname).toLowerCase();
}

export function isLegacyEncodedExternalBlogPath(pathname: string) {
  return cleanPathname(pathname).startsWith("/blog/external/external-");
}
