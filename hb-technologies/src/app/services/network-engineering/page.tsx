import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("network-engineering");

export default function Page() {
  return <ServiceDetailPage slug="network-engineering" />;
}
