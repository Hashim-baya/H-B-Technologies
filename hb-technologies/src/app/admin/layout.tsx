import { createPageMetadata, noIndexNoFollowRobots } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "VIZIA Technologies admin content editor.",
  path: "/admin",
  robots: noIndexNoFollowRobots,
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
