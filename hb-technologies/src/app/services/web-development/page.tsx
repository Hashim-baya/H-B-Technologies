import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("web-development");

export default function Page() {
  return <ServiceDetailPage slug="web-development" />;
}
