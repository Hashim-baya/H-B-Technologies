import { createPageMetadata, noIndexNoFollowRobots } from "@/lib/seo";
import GonePage from "../gone";

export const metadata = createPageMetadata({
  title: "Resource Gone",
  description: "This resource is no longer available and has been permanently removed.",
  path: "/410",
  imageLabel: "Resource gone",
  robots: noIndexNoFollowRobots,
});

export default GonePage;
