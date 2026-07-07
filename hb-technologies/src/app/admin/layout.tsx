import { createPageMetadata, noIndexNoFollowRobots } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Admin Content Editor",
  description: "Private VIZIA Technologies content editor for authorized administrators.",
  path: "/admin",
  imageLabel: "Admin",
  robots: noIndexNoFollowRobots,
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
