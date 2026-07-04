import ServiceDetailPage from '@/components/ServiceDetailPage';
import { createStaticServiceMetadata } from '@/lib/seo';

export const metadata = createStaticServiceMetadata("automation-systems");

export default function Page() {
  return <ServiceDetailPage slug="automation-systems" />;
}
