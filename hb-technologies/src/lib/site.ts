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

const PRODUCTION_SITE_URL = "https://www.vizia.co.ke";
const LOCAL_SITE_URL = "http://localhost:3000";

function fromVercelDomain(value?: string) {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
}

function resolveSiteUrlInput() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
    fromVercelDomain(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    fromVercelDomain(process.env.VERCEL_URL),
    PRODUCTION_SITE_URL,
    LOCAL_SITE_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return new URL(candidate).toString();
    } catch {
      continue;
    }
  }

  return LOCAL_SITE_URL;
}

export function getSiteUrl() {
  const raw = resolveSiteUrlInput();
  const url = new URL(raw);
  url.hash = "";
  url.search = "";

  return url;
}
