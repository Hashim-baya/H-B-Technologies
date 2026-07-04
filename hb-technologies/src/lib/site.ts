export const siteConfig = {
  name: "VIZIA Technologies",
  language: "en",
  locale: "en_US",
  description:
    "Secure-by-design software engineering and technology solutions: web & mobile development, cyber security, data & AI, network engineering, automation, IoT, and Smart CCTV.",
  keywords: [
    "software development company",
    "web development",
    "mobile app development",
    "cyber security firm",
    "AI solutions provider",
    "machine learning",
    "natural language processing",
    "IoT automation company",
    "smart CCTV installation",
    "IT consultation",
  ],
  jsonLdOrganization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VIZIA Technologies",
    url: "",
    description:
      "Secure-by-design software engineering and technology solutions for startups, SMEs, enterprises, and government institutions.",
    knowsAbout: [
      "Web Development",
      "Mobile App Development",
      "Cyber Security",
      "Data Science",
      "Network Engineering",
      "Automation Systems",
      "IoT Solutions",
      "Smart CCTV Installation",
      "IT Consultation",
      "Artificial Intelligence",
      "Machine Learning",
      "Natural Language Processing",
    ],
  },
} as const;

const LOCAL_SITE_URL = "http://localhost:3000";

function fromVercelDomain(value?: string) {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
}

function resolveSiteUrlInput() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    fromVercelDomain(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    fromVercelDomain(process.env.VERCEL_URL) ||
    LOCAL_SITE_URL
  );
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getSiteUrl() {
  const raw = resolveSiteUrlInput();
  const url = new URL(raw);
  url.hash = "";
  url.search = "";

  if (process.env.NODE_ENV === "production" && isLocalHostname(url.hostname)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set to the production origin before building or running the SEO frontend."
    );
  }

  return url;
}
